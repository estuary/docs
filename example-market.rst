
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
        "bid":  {"price": 321.09, "size": 100},
        "ask":  {"price": 321.45, "size": 200},
        "last": {"price": 321.12, "size": 50}
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

This is a *captured* collection, meaning that records are directly written into it.
Estuary provides an API which accepts authenticated HTTP PUTs of one or more records at
``https://estuary.dev/api/name/of/collection/ticks``.


Deriving Daily Stats
*********************

Suppose we want a view over daily statistics of securities: first and last transactions,
volume, average transaction price, bid, ask, spread, etc. Let's begin with an example of
what our desired statistics record might look like:

.. code-block:: json

    {
      "exchange": "NYSE",
      "security": "APPL",
      "date": "2019-01-16",
      "price":  { "low": 319.31, "high": 323.33, "avgN": 7294940268.32, "avgD": 22655094 },
      "bid":    { "low": 319.27, "high": 323.27, "avgN":   24258004.35, "avgD": 75516 },
      "ask":    { "low": 319.45, "high": 323.39, "avgN":   24276883.89, "avgD": 75516 },
      "spread": { "low":   0.25, "high":   0.42, "avgN":      27940.92, "avgD": 75516 },
      "volume": 22655094,
      "first":  { "price": 319.97, "size": 150 },
      "last":   { "price": 323.09, "size": 200 }
    }

This record presents low and high water marks for trace prices, bids, asks, and spreads
over the course of a date, as well as averages which are broken out into separate numerator
and denominator components (eg, spread average is 27940/75516 = $0.37). It also tracks the
first and last trade of the day, as well as the total share volume. ``price`` is the average
trade price weighted by the number of transacted shares, while ``bid/ask/spread`` are
averaged over the total number of trade ticks observed (75,516).

We'll build this record via reduction, by answering two questions:

1) If we had exactly one record in "ticks", what would it's daily statistics record look like?
2) If we have two statistics records for the same date & security, how do we combine them?

Let's begin to answer 1) with an example. A "ticks" record, repeated from before:

.. code-block:: json

    {
        "exchange": "NYSE",
        "security": "APPL",
        "time": "2019-01-16T12:34:56Z",
        "bid":  {"price": 321.09, "size": 100},
        "ask":  {"price": 321.45, "size": 200},
        "last": {"price": 321.12, "size": 50}
    }

And it's corresponding statistics record:

.. code-block:: json
    :name:

    {
      "exchange": "NYSE",
      "security": "APPL",
      "date": "2019-01-16",
      "price":  { "low": 321.12, "high": 321.12, "avgN":  16056, "avgD": 50 },
      "bid":    { "low": 321.09, "high": 321.09, "avgN": 321.09, "avgD": 1 },
      "ask":    { "low": 321.45, "high": 321.45, "avgN": 321.45, "avgD": 1 },
      "spread": { "low":   0.36, "high":   0.36, "avgN":   0.36, "avgD": 1 },
      "volume": 50,
      "first":  { "price": 321.12, "size": 50 },
      "last":   { "price": 321.12, "size": 50 }
    }

If we see just this trade tick today, then the low, high, and average price statistics
will of course just be the present values from our tick record. Our last trade was
50 shares, so we'll weight the average price by that, and other average statistics are
weighted by 1 because we've seen just one tick. Our spread is simply the current ask
minus bid, and by definition a single tick is also the first and last trade of the day.

Grounding things out, here's a simple jq_ filter that *projects* a single tick record into
a corresponding statistics record, which produced the example above. This is an example of
a "pure" function, as it's output depends only on the current input tick:

.. code-block:: none

    {
      exchange: .exchange,
      security: .security,
      # Date is produced by truncating from "2020-01-16T12:34:56Z" => "2020-01-16".
      date:   .time | fromdate | strftime("%Y-%m-%d"),
      # Price stat uses a by-volume weighted average of trades.
      price:  {low: .last.price, high: .last.price, avgN: (.last.price * .last.size), avgD: .last.size},
      # Bid, ask, and spread stats use equal weighting of observed prices across ticks.
      bid:    {low: .bid.price,  high: .bid.price,  avgN: .bid.price, avgD: 1},
      ask:    {low: .ask.price,  high: .ask.price,  avgN: .ask.price, avgD: 1},
      spread: ((.ask.price - .bid.price) as $s | {low: $s, high: $s, avgN: $s, avgD: 1}),
      volume: .last.size,
      first:  .last,
      last:   .last,
    }

The next question is, given two such records, how do we combine them? Hopefully this is
now intuitive: given two records, we'll use the minimum of their ``low`` fields, the
maximum of ``high``, and the ``avgN/avgD/volume`` fields can be summed to reflect the
total volume and weighted averages of both records. Assume we know which record
came first, and we'll pick ``first`` and ``last`` trade fields appropriately. Having
figured this out, we can now repeat this operation regardless of whether we have two
records to reduce, or two billion.

Within Estuary, reductions happen automatically. We merely need to *explain* how
reduction can be accomplished for our collection record types, and the platform will
apply the operation on our behalf (and at every opportunity). The way we do this is
through ``reduce`` keyword annotations which accompany our JSON-Schema_ definitions.
Here's a schema for our statistics record with ``reduce`` annotations that implement
the rules we previously worked through:

.. code-block:: json

    {
      "$def": {
        "priceStats": {
          "type": "object",
          "properties": {
            "low":  { "type": "number",  "reduce": "minimize" },
            "high": { "type": "number",  "reduce": "maximize" },
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

We've broken out the ``priceStats`` schema for reuse within the ``securityStats`` schema.
``securityStats`` then models our statistics of interest as ``priceStats``, along with the
security, exchange, and date. To put it all together, we now need to declare a derived collection:

.. code-block:: yaml

    createCollections:
      - name: name/of/collection/stats
        schema: "http://example/market-schema.json#/$def/securityStats"
        primaryKey: [ "/security", "/date" ]
        derive:
          - fromCollection: name/of/collection/ticks
            withJq: |
                ... our jq filter ...

Let's break this down. We're creating a new collection "stats" which has the ``securityStats``
schema. We've associated a primary key, which indicates that two records having the same
``security`` and ``date`` property values may be reduced together using the ``reduce``
annotations we've defined.

We'll be deriving our collection from records of "ticks" using our jq_ filter from before.
We haven't specified a ``groupBy`` clause, and the "ticks" collection itself doesn't have
a primary key, which means that our jq filter will be invoked with every input record of
"ticks".

Our jq_ filter will *project* each tick record into it's corresponding ``securityStats``
shape. Under the hood, Estuary will then use the ``reduce`` annotations we defined with
our schema in order to reduce ``securityStats`` instances over our ``(security, date)``
composite primary key.

And... that's it. Our "stats" collection is off and running, and will continuously update
itself from "ticks". We don't have to worry about scaling. Our jq filter is easily scaled
up and down as needed. Should the "ticks" or "stats" collection have a sufficiently high
volume of records, it will automatically be partitioned as needed.

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
    CREATE TABLE daily_stats (
        exchange  VARCHAR NOT NULL
        security  VARCHAR NOT NULL,
        date      DATE    NOT NULL,

        bid_low   DOUBLE PRECISION,
        bid_high  DOUBLE PRECISION,
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
