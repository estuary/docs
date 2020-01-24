
Example: Market Data
=====================

Capturing Ticks
****************

Suppose we have an incoming stream of stock market transaction "ticks",
roughly matching what's known as `Level 1 Market Data`_:

.. code-block:: json

    {
        "exchange": "NYSE",
        "security": "APPL",
        "time": "2019-01-16T12:34:56Z",
        "bid":  {"price": 315.79, "size": 100},
        "ask":  {"price": 317.45, "size": 200},
        "last": {"price": 316.28, "size": 50}
    }

Each document of the stream represents a stock transaction that has occurred (``last``),
as well as the current best offers to sell (``ask``) or buy (``bid``) the security.

We can use vanilla JSON-Schema_ to model these documents, with sub-schemas broken out
for composition and future re-use:

.. code-block:: json

    {
      "$schema": "https://json-schema.org/draft/2019-09/schema",
      "$id": "http://example/market-schema.json",

      "$def": {
        "exchange": { "enum": [ "NYSE", "NASDAQ", "SEHK" ] },
        "security": {
          "type": "string",
          "minLength": 2,
          "maxLength": 10
        },
        "priceAndSize": {
          "properties": {
            "price": { "type": "number", "exclusiveMinimum": 0 },
            "size":  { "type": "integer", "minimum": 1 }
          },
          "required": ["price", "size"]
        },
        "tick": {
          "properties": {
            "exchange": { "$ref": "#/$def/exchange" },
            "security": { "$ref": "#/$def/security" },
            "time":     { "format": "date-time" },
            "bid":      { "$ref": "#/$def/priceAndSize" },
            "ask":      { "$ref": "#/$def/priceAndSize" },
            "last":     { "$ref": "#/$def/priceAndSize" }
          },
          "required": [ "exchange", "security", "time" ]
        }
      }
    }

Next let's declare a collection of tick records:

.. code-block:: yaml

    createCollections:
      - name: name/of/collection/ticks
        schema: http://example/market-schema.json#/$def/tick
        partitions:
          - name: exchange
            field: /exchange
          - name: part
            as: automaticPartition
          - name: insertDate
            as: fileCreationDate

Our collection does not have a primary key, but we are going to partition it on a few fields
which will allow us to efficiently select subsets of collection records:

* ``exchange`` is extracted directly from each record.
* ``part`` names partitions automatically created by Estuary, like ``000``, ``001``, etc.
  This partition is always present, and if omitted in the declaration a default field
  name of ``part`` will still be used.
* ``insertDate`` is the UTC creation date of individual files making up the collection.
  Estuary doesn't use this directly, but it can be useful in tools like Snowflake or
  BigQuery that understand push-down of Hive partition predicates.

.. admonition:: Example

    Given these partitions, we expect to see collection files in cloud storage with prefixes like:
    ``s3://my-bucket/name/of/collection/ticks/exchange=NYSE/part=001/insertDate=2019-01-16/``.

This is a *prime* collection, meaning that records are directly written into it. Estuary
provides an API which accepts authenticated HTTP PUTs of one or more records at
``https://estuary.dev/api/name/of/collection/ticks``.


Deriving Daily Stats
*********************

Suppose we want a view over daily statistics of securities: first and last transactions,
volume, average transaction price, bid, ask, spread, etc. Let's first define some JSON-Schema_.
We'll also use the ``reduce`` keyword annotation to describe how to reduce documents of our schema:

.. code-block:: json

    {
      "$def": {
        "priceStats": {
          "type": "object",
          "properties": {
            "min":  { "type": "number",  "reduce": "minimize" },
            "max":  { "type": "number",  "reduce": "maximize" },
            "avgN": { "type": "number",  "reduce": "sum" },
            "avgD": { "type": "integer", "reduce": "sum" }
          },
          "reduce": "merge",
        },
        "securityStats": {
          "properties": {
            "exchange": { "$ref": "#/$def/exchange" },
            "security": { "$ref": "#/$def/security" },
            "date":     { "format": "date" },
            "bid":      { "$ref": "#/$def/priceStats" },
            "ask":      { "$ref": "#/$def/priceStats" },
            "spread":   { "$ref": "#/$def/priceStats" },
            "volume":   { "type": "integer", "reduce": "sum" },
            "first":    { "$ref": "#/$def/priceAndSize", "reduce": "firstWriteWins" },
            "last":     { "$ref": "#/$def/priceAndSize", "reduce": "lastWriteWins" }
          },
          "reduce": "merge",
          "required": [ "exchange", "security", "date" ]
        }
      }
    }

We've broken out the ``priceStats`` schema for re-use within the ``securityStats`` schema.
``priceStats`` reduces the minimum and maximum price, as well as it's weighted
average (where the average numerator and denominator are reduced individually).

``securityStats`` then bundles a number of statistics of interest, along with the security,
exchange, and date. To set things in motion, we now need to declare a derived collection:

.. code-block:: yaml

    createCollections:
      - name: name/of/collection/stats
        schema: "http://example/market-schema.json#/$def/securityStats"
        primaryKey: [ "/security", "/date" ]
        derive:
          - fromCollection: name/of/collection/ticks
            withJq: |
              {
                exchange: .exchange,
                security: .security,
                # Date is produced by truncating from "2020-01-16T12:34:56Z" => "2020-01-16".
                date:   .time | fromdate | strftime("%Y-%m-%d"),
                # Price stat uses a by-volume weighted average of trades.
                price:  {min: .last.price, max: .last.price, avgN: (.last.price * .last.size), avgD: .last.size},
                # Bid, ask, and spread stats use equal weighting of observed prices across ticks.
                bid:    {min: .bid.price,  max: .bid.price,  avgN: .bid.price, avgD: 1},
                ask:    {min: .ask.price,  max: .ask.price,  avgN: .ask.price, avgD: 1},
                spread: ((.ask.price - .bid.price) as $s | {min: $s, max: $s, avgN: $s, avgD: 1}),
                volume: .last.size,
                first:  .last,
                last:   .last,
              }

Let's break this down. We're creating a new collection "stats" which has the ``securityStats``
schema. We've associated a primary key, which indicates that two records having the same
``security`` and ``date`` property values may be reduced together using the ``reduce``
annotations we've defined.

We'll be deriving our collection from records of "ticks" using a jq_ filter. We haven't
specified a ``groupBy`` clause, and the "ticks" collection itself doesn't have a primary
key, which means that our jq filter will be invoked with every input record of "ticks".

The job of our filter is to *project* each tick record into the correct ``securityStats``
shape. In other words, it's answering the question "If I see one (and only one) tick of
this security today, what should its entry in ``securityStats`` look like?".

And... that's it. Having defined what stats look like for a *single* tick, we can rely
on our reduce annotations to correctly update statistics when there are *lots* of ticks.

Our "stats" collection is off and running, and will continuously update itself from
"ticks". We don't have to worry about scaling. Our jq filter is a "pure" function,
and is dynamically scaled up and down as needed. Should the "ticks" or "stats"
collection have a sufficiently high volume of records, it will automatically be
partitioned as needed.

.. tip::

    A ``where`` clause can also be applied to a source collection to restrict the set
    of partitions to read. This is useful when the source collection is a tagged union
    partitioned on the type tag, as ``where`` provides a zero-cost means of filtering
    to desired event types.

    In this example, we might also use ``where`` to build independent stats tables for
    each market exchange:

    .. code-block:: yaml

      derive:
        - fromCollection: name/of/collection/ticks
          where: "exchange = NYSE"


Materializing to PostgreSQL
****************************

Derived collections are cool and all, but what we actually want is an ability
to query for the current stats of securities. We want to *materialize* the
collection into a database table that's updated in real-time:

.. code-block:: yaml

    materialize:
      - fromCollection: name/of/collection/stats
        intoPostgresql:
          endpoint: postgres://127.0.0.1:5432/my-db
          table: daily_stats

Given this stanza, Estuary creates the table ``daily_stats`` in the target database
with a table definition projected from the collection schema & primary key, which
is continuously updated to reflect the "stats" collection.

.. code-block:: SQL

    -- This daily_stats SQL schema is statically inferred from its JSON-Schema.
    -- Estuary may support additional annotations for advanced table creation use cases.
    CREATE TABLE daily_stats (
        exchange  VARCHAR NOT NULL
        security  VARCHAR NOT NULL,
        date      DATE    NOT NULL,

        bid_min   DOUBLE PRECISION,
        bid_max   DOUBLE PRECISION,
        bid_avgN  DOUBLE PRECISION,
        bid_avgD  INTEGER,

        ... etc ...

        volume      DOUBLE PRECISION,
        first_price DOUBLE PRECISION,
        first_size  INTEGER,
        last_price  DOUBLE PRECISION,
        last_size   INTEGER,

        PRIMARY KEY (security, date)
    );

.. _JSON-Schema: https://json-schema.org
.. _Level 1 Market Data: https://www.investopedia.com/terms/l/level1.asp
.. _jq: https://stedolan.github.io/jq/
