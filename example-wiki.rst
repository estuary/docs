
Example: Wiki Attributes
=========================

Article Snapshots
******************

We'll be implementing a simple "knowledge graph" extracted from Wikipedia articles.
Suppose we have a crawler which monitors Wikipedia pages and occasionally extracts
snapshots like:

.. code-block:: json

    {
        "page": "https://en.wikipedia.org/wiki/NASA",
        "extracted": "2020-01-22",
        "attributes": {
            "Motto": "For the Benefit of All",
            "Employees": 17219,
            "Administrator": "Jim Bridenstine"
        }
    }

Let's begin with a bit of JSON-Schema_ to model these snapshots:

.. code-block:: json

    {
      "$schema": "https://json-schema.org/draft/2019-09/schema",
      "$id": "http://example/wiki-schema.json",

      "$def": {
        "snapshot": {
          "properties": {
            "page":      { "format": "uri" },
            "extracted": { "format":  "date" },
            "attributes": {
              "additionalProperties": { "type": ["string", "number"] }
            }
          },
          "required": ["page", "extracted"]
        }
      }
    }

Next let's create a "snapshots" collection:

.. code-block:: yaml

    createCollections:
      - name: name/of/collection/snapshots
        schema: http://example/wiki-schema.json#/$def/snapshot

Crawler snapshots give us a point-in-time view of an article, but don't provide
an understanding of *how* the article is changing over time.

Query-Time Histories via Reduction
***********************************

We can leverage ``reduce`` annotations to do some heavy lifting for us. Our strategy
will be to *project* each snapshot into a shape that can be reduced to build our
understanding of how attributes are changing.

Here's a jq_ filter to illustrate the approach. ``attributeHistory`` will be a map
with keys that compose attribute names *and* values. It will have values that
capture the extraction date:

.. code-block:: none

    {
        page: .page,
        lastExtracted: .extracted,
        attributeHistory: (
            .extracted as $e |
            .attributes |
            with_entries({
                key: "\(.key)|\(.value)",
                value: {
                    first: $e,
                    last: $e
                }
            }))
    }

Running this filter over our initial NASA snapshot yields:

.. code-block:: json

    {
      "page": "https://en.wikipedia.org/wiki/NASA",
      "lastExtracted": "2020-01-22",
      "attributeHistory": {
        "Motto|For the Benefit of All": {
          "first": "2020-01-22",
          "last": "2020-01-22"
        },
        "Employees|17219": {
          "first": "2020-01-22",
          "last": "2020-01-22"
        },
        "Administrator|Jim Bridenstine": {
          "first": "2020-01-22",
          "last": "2020-01-22"
        }
      }
    }

We can pair this jq_ filter with JSON-Schema_ ``reduce`` annotations that will
merge *all* values that an attribute has taken from our "snapshots" collection,
along with the first and last extraction date the value was seen with:

.. code-block:: json

    {
      "$def": {
        "firstAndLastExtractionDate": {
            "properties": {
                "first": { "format": "date", "reduce": "minimize" },
                "last":  { "format": "date", "reduce": "maximize" }
            },
            "reduce": "merge"
        },

        "attributeHistories": {
          "properties": {
            "page":          { "format": "uri" },
            "lastExtracted": { "format": "date", "reduce": "maximize" },
            "attributeHistory": {
              "additionalProperties": { "$ref": "/$def/firstAndLastExtractionDate" },
              "reduce": "merge",
            },
          }
        }
      }
    }

Now to put it all together. Derive a collection of attribute histories
from "snapshots", and then materialize into BigTable. Our "attributeHistories"
collection will use a ``primaryKey``, which implies that records are reducible
on that key.

.. code-block:: yaml

    createCollections:
      - name: name/of/collection/attributeHistories
        schema: "http://example/wiki-schema.json#/$def/attributeHistories"
        primaryKey: [ "/page" ]
        derive:
          - fromCollection: name/of/collection/snapshots
            withJq: |
                ... our jq filter above ...

    materialize:
      - fromCollection: name/of/collection/attributeHistories
        intoBigtable:
          gcp-project:  my-gcp-project
          gcp-instance: my-history-table

Now we can query articles from BigTable and -- by comparing ``lastExtracted`` with
``first`` & ``last`` -- understand how attributes and their values have changed over
time. We know "Administrator|Robert M. Lightfoot, Jr" was *removed* after the
2018-04-23 extraction, "Administrator|Jim Bridenstine" was *added* with 2018-04-26,
and that it's still current (``last`` matches ``lastExtracted``):

.. code-block:: json

    {
        "page": "https://en.wikipedia.org/wiki/NASA",
        "lastExtracted": "2020-01-22",
        "attributeHistory": {
            "Administrator|Robert M. Lightfoot, Jr": {
                "first": "2017-01-20",
                "last":  "2018-04-23",
            },
            "Administrator|Jim Bridenstine": {
                "first": "2018-04-26",
                "last":  "2020-01-22",
            }
        }
    }

This strategy is simple, and requires no index or database whatsoever aside from
our BigTable materialization. Our jq_ filter is a "pure" function which is easily
scaled, and under the hood Estuary is orchestrating the entire flow in terms of
distributed partial reductions occurring within in-memory windows. While that's
a mouthful, it means there are no heavy-weight components that can fail, little
coordination overhead is imposed, and the whole mess scales up or down easily.

Applying reduction is a good fit when we have pull-based use cases where we only
need change histories at query time. It does have some drawbacks. One is that our
history is lossy: we're not capturing the case where a value is added, removed,
and then added again. We're also not able to proactively detect that a change
has occurred and "push" an event into another system or API. We can only make
that determination after-the-fact by querying the article's current history out
of the materialized BigTable instance.

Real-time Changes via Closure
******************************

We'd like to process snapshots in real-time, and -- in that moment -- transform them
into explicit *change events* that represent addition, update, and removal of
constituent ``attributes``:

.. code-block:: json

    {
        "page":        "https://en.wikipedia.org/wiki/NASA",
        "attribute":   "Administrator",
        "event":       "update",
        "value":       "Jim Bridenstine",
        "date":        "2018-04-26",
        "priorValue":  "Robert M. Lightfoot, Jr",
        "priorDate":   "2017-01-20"
    }

As per our usual, here's some JSON-Schema_ for our events:

.. code-block:: json

    {
      "$def": {
        "attributeEvent": {
          "properties": {
            "page":       { "format": "uri" },
            "attribute":  { "type": "string" },
            "event":      { "enum": ["add", "remove", "update"] },
            "value":      { "type": ["string", "number"] },
            "date":       { "format": "date" },
            "priorValue": { "type": ["null", "string", "number"] },
            "priorDate":  { "format": "date" }
          },
          "required": ["page", "attribute", "event"]
        }
      }
    }

In order to transform an article snapshot into events of this kind, we must
have an understanding of the article's previously seen attributes. Our transform
needs to maintain some state, and that means we need to use a closure.

Our closure will read from snapshots grouped by article page, so that snapshots
of a given article will always be seen by the same (parallel) closure runner.
Each runner will maintain an independent inner state of previous attributes for
articles it's seen. This state will be used to detect whether future snapshot attributes
are repetitions, or represent meaningful changes. If it's a meaningful change, we'll
emit a corresponding event with the prior value.

Collection records are instances of JSON objects, but we'll be implementing our
closure in terms of SQL statements. The SQL context has two key tables -- ``input``
and ``output`` -- which are created on our behalf using schemas derived from
associated collection JSON-Schema_. Collection records are mapped into and
out of these tables by the runtime:

.. code-block:: sql

    -- The `input` table corresponds to an article snapshot record. Fixed
    -- properties of the JSON-schema are mapped to table columns. Properties
    -- with object or array values--like "attributes"--will contain encoded JSON
    -- which can be processed using SQLite's json functions.
    -- The complete input record is also available as `_root`, encoded as JSON.
    CREATE TABLE IF NOT EXISTS input (
      _root      TEXT NOT NULL,
      page       TEXT NOT NULL,
      extracted  DATE NOT NULL,
      attributes TEXT,

      PRIMARY KEY(page) -- Primary key is inferred from source `groupBy`.
    );

    -- The `output` table captures "attributeEvent" records produced by the
    -- function. Like `input`, JSON-Schema properties are mapped to columns.
    -- SQLite's json functions can be used to build object or array values.
    -- `_root` is also available to directly return a JSON instance.
    CREATE TABLE IF NOT EXISTS output (
      _root       TEXT,
      page        TEXT NOT NULL,
      attribute   TEXT NOT NULL,
      event       TEXT NOT NULL,
      value       BLOB,
      date        DATE,
      priorValue  BLOB,
      priorDate   TEXT,
    );

With that context, we can now put together a complete closure for implementing
attribute change detection:

.. code-block:: yaml

    createCollections:
      - name: name/of/collection/attributeEvents
        schema: http://example/wiki-schema.json#/$def/attributeEvent
        derive:
          - fromCollection: name/of/collection/snapshots
            groupBy: ["/page"]
            withSqlite:

              closure:
                # Recall that closures--unlike pure functions--must have
                # a fixed number of runners.
                runners: 32

              # Bootstrap statements invoked on runner startup.
              bootstrap: |
                -- Table `input` exposes the "attributes" JSON object as text.
                -- Create a view which flattens attributes & values into a table.
                CREATE VIEW IF NOT EXISTS input_attributes AS
                  SELECT page, a.key AS attribute, a.value, extracted AS date
                  FROM input, JSON_EACH(input.attributes) AS a;

                -- Table `prior_attributes` is inner state of the closure which tracks the last
                -- attribute values for each wiki page, along with its first extraction date.
                CREATE TABLE IF NOT EXISTS prior_attributes (
                  page      TEXT NOT NULL,
                  attribute TEXT NOT NULL,
                  value     BLOB NOT NULL,
                  date      DATE NOT NULL,
                  PRIMARY KEY(page, attribute)
                );

              # Function processes snapshot records from the `input` table and, in turn,
              # writes derived change event records to the `output` table.
              function: |
                -- Left-join `input_attributes` with `prior_attributes` to detect added
                -- and updated attributes. Add each to `output`.
                INSERT INTO output (page, attribute, value, date, priorValue, priorDate, event)
                  SELECT i.page, i.attribute, i.value, i.date, p.value, p.date,
                      CASE WHEN p.value IS NULL THEN "add" ELSE "update" END
                    FROM      input_attributes AS i
                    LEFT JOIN prior_attributes AS p
                    ON        i.page = p.page AND i.attribute = p.attribute
                    WHERE     p.value IS NULL OR  i.value <> p.value;

                -- Left-join `prior_attributes` with `input_attributes` to detect deleted
                -- attributes. Add each to `output`.
                INSERT INTO output (page, attribute, priorValue, priorDate, event)
                  SELECT p.page, p.attribute, p.value, p.date, "remove"
                    FROM      prior_attributes AS p
                    LEFT JOIN input_attributes AS i
                    ON        p.page = i.page AND p.attribute = i.attribute
                    WHERE     p.page IN (SELECT page FROM input) AND i.attribute IS NULL;

                -- Update `prior_attributes` by deleting removed attributes.
                DELETE FROM prior_attributes WHERE (page, attribute) IN (
                  SELECT o.page, o.attribute FROM output AS o WHERE o.value IS NULL);

                -- Upsert added or updated attributes into `prior_attributes`.
                INSERT INTO prior_attributes (page, attribute, value, date)
                  SELECT o.page, o.attribute, o.value, o.date FROM output AS o WHERE o.value NOT NULL
                  ON CONFLICT(page, attribute) DO UPDATE SET value = EXCLUDED.value, date = EXCLUDED.date;

Our closure used a group-by when reading from "snapshots", but the derived
"attributeEvents" collection has no primary key and isn't reducible. It will capture
the complete history of attribute changes over time. We could derive new collections
which summarize these events further, or call a remote HTTP lambda. We could materialize
them into a database table, or analyze collection records directly from cloud storage.

Closures are powerful, but under the hood each closure instance requires a replicated
and highly-available database to be provisioned. They can also be trickier to scale:
if we changed the number of runners of our closure above, it would alter the mapping
of article to closure runner, and break the invariant that a designated runner has
seen all prior snapshots of an article.

For this reason, you must be explicit about your resource expectations when defining
closures. Rather than attempting to scale an existing closure, it's often easier to
simply derive a new collection which re-builds the closure's inner state using more
runners.


.. _jq: https://stedolan.github.io/jq/
.. _JSON-Schema: https://json-schema.org
.. _Knowledge Graph: https://en.wikipedia.org/wiki/Knowledge_Graph
