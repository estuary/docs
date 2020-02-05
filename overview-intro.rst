
Introduction
=============

Managing data flows within an enterprise is complicated and time consuming, especially when there's a desire to gain insights and take actions in real-time.  Having a microservice oriented architecture is valuable but can further complicate things, leading to a tangled mess of data webs going from different sources of truth to databases and SaaS tools.

Estuary makes it easy to deploy and maintain real-time ETL pipelines which keep all your databases and SaaS tools in perfect sync.  How it works:

- Plug Estuary into your data sources: Kinesis, Kafka, Segment, log files, and more.

- Express transformations that select, group-by, aggregate, and join SQL records and JSON documents.

- Load into anything: databases, data lakes, Elastic, DynamoDB, DataDog, Snowflake and more. ETL pipelines run continuously and destinations are always up-to-date.

- Track changes to pipelines and collaborate with users using version control powered by Git.

Estuary can make it easy to turn any and all of your databases to real-time databases at any scale.

Concepts
=========

Collections
************

An Estuary **Collection** is an append-only set of immutable *records*. Records are
JSON documents, and each must be valid to the collection's associated JSON-Schema_.
Schemas may impose no structure, may be rigorously specified, or fall somewhere in
between. They may also evolve over time, though not in such a way that they
invalidate records already part of the collection.

**Collections are optimized for stream processing**.

   Ingest records with low latency, even when scaling to massive record volumes
   (millions of QPS). The current readers of a collection are notified of new records
   within milliseconds.

**Collections are also Data Lakes**.

   Collections organize, index, and store records within a hierarchy of files
   implemented atop cloud storage. Data rests exclusively within buckets you own.

   Files hold record content (eg, JSON lines) with no special formatting,
   and can be directly processed using preferred tools and work flows.

**Collections are a long-term source of truth**.

   Apply retention policies driven by your organizational requirements –
   not your available disk space.

   A new derivation or materialization seamlessly back-fills over all
   collection records, even where they span months or even years of data.

**A collection is either captured or derived**.

   A *captured* collection is one into which records are directly written.
   Estuary provides HTTP and syslog APIs for capturing events into collections.
   Ingested events are verified against the collection JSON-Schema_ and rejected
   or dead-lettered when found invalid.

   *Derived* collections are akin to a materialized view in a database.
   They're declared in terms of source collections and transformations to apply,
   and continuously update as the source collections change.

**They may be explicitly and/or automatically partitioned**.

   Records are segregated by partition and are organized within cloud storage using
   a Hive-compatible layout. Partitioned collections are directly interpretable as
   external tables by tools that understand Hive partitioning and predicate
   push-down -- like Snowflake, BigQuery, and Hive itself. Estuary generates suitable
   external table definitions which can be plugged into these tools.

   Explicit partitions derive field values from records themselves, specified by
   JSON-Pointer_. A collection of stock market records might partition on the
   market exchange (``NYSE``, ``NASDAQ``, etc). Automatic partitions are managed
   by Estuary, and allow collections to scale up to arbitrary record volumes.

**They may declare a primary key**.

   Primary keys may be scalar or composite keys and are specified via JSON-Pointer_,
   where pointers denote the location of the key's field within record documents.

   Setting a primary key also indicates that records of the collection are
   *reducible* on that key, and that the "value" of a key must be *materialized*
   by reducing over all of the key's records in the collection.

.. _JSON-Schema: https://json-schema.org
.. _JSON-Pointer: https://tools.ietf.org/html/rfc6901


JSON-Schema
************

JSON-Schema_ is a draft standard for describing the expected structure and semantics
of JSON documents. Schemas are compose-able and reusable, and may include conditionals
and dependencies that make it possible to represent `tagged unions`_ and other complex,
real-world composite types.

The standard also formalizes a concept of "Annotations_" through which schemas can
conditionally attach metadata within a validated JSON document. For example, a schema
validating a union type might attach ``description`` annotations to certain fields
depending on the document's matched union variant -- descriptions which are later
used to power tool-tips appearing within a UI.

All Estuary collections have an associated JSON-Schema_, and Estuary further extends
JSON-Schema_ with vocabularies for defining *reduction behaviors* over JSON documents.

.. _`tagged unions`: https://en.wikipedia.org/wiki/Tagged_union
.. _Annotations: https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.7.7


Commit-Log Interpretation
**************************

While collections may have keys, unlike a traditional database a record added to a
keyed collection does not modify an older record having the same key. Both records are
immutably part of the collection. This appears... unhelpful when we actually care about
*mutable* states like fact tables of dimensions and metrics, or social graphs, or
comments of a blog post.

The trick is to interpret collection records as *immutable* events which update a
*mutable* state: in other words, as a commit log. A map of keys and values can
be updated by appending a collection record which sets a new value for a given key.
Then, the current state of the map can be *materialized* by reading collection
records and indexing the present value for each key.

Using a collection might seem rather round-about for a simple key/value map--why not just
use DynamoDB or Memcached directly, and call it a day?--but its advantage becomes clear
as soon as one wants *both* DynamoDB and Memcached, or indexes in multiple clouds or regions,
or one wants to study how keys have changed over time. A collection can be read over and over
again, now or in the future, without any coordination or operational risk to production
infrastructure, and every reader will materialize the *exact same state*.


Materialization
****************

Estuary does much of the heavy lifting when materializing states from collections, and can
automatically load collections into a number of common database, indexes, and SaaS tools.
The JSON-Schema_ of the collection is used to derive and create appropriate table schemas
in the target system.

Collections without a key are loaded one-for-one into the target system. It gets more
interesting when materializing a collection that's declared with a primary key:

* Records of the collection are interpreted as modeling a mutable state of the key.
  For example, a key might compose dimensions of a fact table, or be a user name,
  or a blog post ID.

  When materializing into a database or index, collection records are *mapped* to
  corresponding relation rows or key/value entries by the record key.

* Records also have a well-defined *reduction* operation for producing updated states.
  We've discussed one example already--map updates are reduced by taking the last value
  written for a given key--but much more sophisticated reductions can be expressed.
  Reductions might update metrics of a fact table, or accumulate friend connections
  in a social graph, or track top comments of blog posts.

  When materializing, the current mapped value is *read* and is then *modified* by
  reducing new records into its present value.

Materialization is very efficient, even when materializing a high-volume collection.
The load imposed on a target system is proportional to the rate by which the
materialization itself changes, and **not** to the underlying record rate of the
collection. A tiny PostgreSQL database can easily support a summary--in real time--
of a collection with millions of record updates per second, so long as the summary
itself easily fits within the database.

.. note::

   A key property of reductions over collections is that they're always associative
   (formally, `a.(b.c) = (a.b).c`).
   
   Estuary leverages this property to significantly reduce record volumes early on
   during processing -- intuitively, in a similar way to how Map/Reduce leverages
   Combiners. This practice lets Estuary easily handle collections with Zipfian_
   key distributions.

.. _Zipfian: https://en.wikipedia.org/wiki/Zipf%27s_law


Reduce Keyword
***************

Estuary extends the JSON-Schema_ vocabulary with an additional ``reduce`` keyword
which annotates how locations within a validated JSON document may be reduced
into another document. A variety of reduction strategies are supported:

:``lastWriteWins``/``firstWriteWins``:
   Reduce by taking the value of the more recently written document.
   If a ``reduce`` annotation is not specified at a document location,
   ``lastWriteWins`` is the assumed default behavior.

   Applies to any JSON type.

   .. code-block:: json

      {
         "schema": { "reduce": "lastWriteWins" },
         "reduce": "foobar",
         "into":   123,
         "output": "foobar"
      }
      {
         "schema": { "reduce": "firstWriteWins" },
         "reduce": "foobar",
         "into":   123,
         "output": 123
      }

:``merge``:
   Reduce by recursively merging each property (of an ``object``) or
   index (of an ``array``).

   Applies to ``object`` and ``array`` types.

   .. code-block:: json

      {
         "schema": { "reduce": "merge" },
         "reduce": { "a": 1, "c": 3 },
         "into":   { "b": 2, "c": 2, "d": 4 },
         "output": { "a": 1, "b": 2, "c": 3, "d": 4 }
      }
      {
         "schema": { "reduce": "merge" },
         "reduce": [1, 2, 3],
         "into":   ["w", "x", "y", "z"],
         "output": [1, 2, 3, "z"],
      }

:``append``/``prepend``:
   Reduce by appending elements of the more-recent document to the end
   of the other.

   Applies to ``string`` and ``array`` types.

   .. code-block:: json

      {
         "schema": { "reduce": "append" },
         "reduce": [3],
         "into":   [1, 2],
         "output": [1, 2, 3],
      }
      {
         "schema": { "reduce": "prepend" },
         "reduce": "foo",
         "into":   "bar",
         "output": "foobar",
      }

:``maximize``/``minimize``:
   Take the larger value, based on numeric or lexicographic comparision.

   A relative JSON-Pointer_ may optionally be provided which locates the
   sub-field of the current JSON value which is to be compared. If omitted,
   the JSON value at the annotation location is compared.

   Applies to ``numeric``, ``integer``, and ``string`` types, or to
   ``object`` or ``array`` types if specified with a relative JSON-pointer_.

   .. code-block:: json

      {
         "schema": { "reduce": "maximize" },
         "reduce": 10,
         "into":   20,
         "output": 20,
      }
      {
         "schema": {
            "reduce": {
               "strategy": "minimize",
               "field":    "/val"
            }
         },
         "reduce": { "val":  "10", "one": 2 },
         "into":   { "val":  "20", "three": 4 },
         "output": { "val":  "10", "one": 2 }
      }

:``add``/``multiply``:
   Add (or multiply) the values.

   Applies to ``numeric`` and ``integer`` types.

   .. code-block:: json

      {
         "schema": { "reduce": "add" },
         "reduce": 10,
         "into":   20.20,
         "output": 30.20,
      }
      {
         "schema": { "reduce": "multiply" },
         "reduce": 10,
         "into":   20.2,
         "output": 202,
      }

:``hyperLogLog``/``hyperMinHash``:
   Fold a string into a HyperLogLog, or merge two HyperLogLogs.

   Applies to ``object`` types, with further restrictions on
   expected object properties.

   .. code-block:: json

      {
         "schema": { "reduce": "hyperLogLog" },
         "reduce": { "fold": "my-item" },
         "into":   { "hll": "... serialized HLL ..." },
         "output": { "hll": "... updated serialized HLL ..." }
      }
      {
         "schema": { "reduce": "hyperLogLog" },
         "reduce": { "hll": "... serialized HLL ..." },
         "into":   { "hll": "... other HLL ..." },
         "output": { "hll": "... merged HLL ..." }
      }

:``tDigest``:
   Fold a number into a T-Digest, or merge two digests.

   Applies to ``object`` types, with further restrictions on
   expected object properties.

   .. code-block:: json

      {
         "schema": { "reduce": "tDigest" },
         "reduce": { "fold": 150.372 },
         "into":   { "td": "... serialized T-Digest ..." },
         "output": { "td": "... updated serialized T-Digest ..." }
      }
      {
         "schema": { "reduce": "tDigest" },
         "reduce": { "td": "... serialized T-Digest ..." },
         "into":   { "td": "... other T-Digest ..." },
         "output": { "td": "... merged T-Digest ..." }
      }

.. note::

    Estuary intends to support a range of probabilistic sketches with reduce
    annotations, but details may change. For example, reduce annotations
    may introduce sketch "flavors" which are designed for compatibility with
    equivalents in target systems of interest, such as BigQuery or Snowflake
    HLLs, etc.


Reduce annotations can be composed and nested to build powerful, reusable
aggregation behaviors. Annotations over ``object`` and ``array`` types also
support an optional eviction policy which constrains these types to a bounded
number of child values, with selection criteria. For example, the following
schema annotates a reduction for weighted random `Reservoir sampling`_:

.. code-block:: json

   {
      "type": "array",

      "additionalItems": {
         "properties": {
            "weight": { "type": "number", "minimum": 0, "maximum": 1 },
            "sample": { "type": "string" }
          }
      },

      "reduce": {
         "strategy": "append",

         "evictAfter": {
            "maxValues": 100,
            "having": "minimum",
            "field":  "/weight"
         }
      }
   }

.. _`Reservoir sampling`: https://en.wikipedia.org/wiki/Reservoir_sampling#Weighted_random_sampling


Transformations
****************

A derived collection is created by pairing one or more *source* collections
with *transformation functions*. Transformations are invoked with input
records of the source collection, and output records of the derived
collection schema.

Transformations fall into two camps: "pure" functions which produce
output records that depend only on the current input record, and closure_
functions which maintain an internal state that may be read and updated
during invocations. Closures can be used to implement change detection,
windowing, joins, and other complex event processing patterns.

Estuary is a distributed system and transformations are often run by many
parallel "runners". Pure functions -- having no state -- are easy to scale
up and down, and Estuary automatically manages their parallelism.

Closures also run in parallel, but the output of a closure may depend on the
current record as well as *all previous input records* of the closure. For
this reason closures must declare a fixed number of runners, each of which
owns an independent instance of the closure's inner state.

For each source collection a "group-by" key may also be specified, which
is used to map each input to a designated runner prior to invocation.
Group-bys are particularly useful for closures: they guarantee that all
instances of a group-by key are observed by the same closure runner.

.. note::

   - If no group-by is declared but the source collection has a primary key,
     the primary key is implicitly the group-by.
   - Source collections having neither a group-by nor primary key distribute
     records arbitrarily across runners.
   - Closure transforms *must* use a group-by (this is almost certainly what
     you want, anyway).

When processing a source collection with a group-by, input records may be
partially reduced on the group-by key *prior* to invoking the transform. Put
differently, transforms are invoked with inputs that *reflect* all source
collection records but may not necessarily be 1:1 with them. If no group-by
is applied, no reduction is done and the transform is called with every source
record.

While a bit odd, this pre-invocation reduction of input records allows Estuary
to ensure excellent performance and solves for a host of issues that commonly
plague complex event processing pipelines (eg, hot-spotting of runners due to
Zipfian_ key distributions). It also means that scaling a source collection's
record rate *doesn't* require a commensurate increase in the number of closure
runners. Runners need only scale to the desired processing rate of input records
*after* grouping.

At the other end, if the derived collection has a primary key then *output*
records of a transform are generally reduced on that key prior to being
added to the collection. An implication is that it's actually quite efficient
to use pure transforms that simply *project* input records into a desired output
shape, and to then rely on automatic reductions to dramatically lower the
effective output record rate.

Several means of specifying transformation functions are supported:

:jq_ filters:

   "jq" is a swiss army knife for working with JSON documents. Use jq filters to
   transform, filter, and project JSON documents from one schema into another.

   jq filters are always "pure" transforms, and run with arbitrary parallelism.

:HTTP Endpoint:

   The function must accept one or more input records via HTTP PUT, and respond
   with one or more output records. HTTP endpoints are a good fit for AWS Lambdas
   or Google Cloud Run functions, and provide an "escape hatch" for implementing
   custom logic or joining records with external tables or indexes.

:Stateful SQLite DB:

   Specify transformations in terms of one or more SQL statements which read
   records from a provided ``input`` table and write to a provided ``output`` table.
   Table definitions are derived from the respective collection JSON-Schema_.

   Transforms may bootstrap and use one or more internal state tables,
   which are guaranteed to be durable to machine and even availability zone
   failures.

   They must pre-declare the number of runners to employ, but are then assured
   that the mapping of group-by keys to runners is stable.

   Transforms may leverage the full capability set of SQLite, including extensions
   for geo-spatial processing, full-text search, working with JSON, and more.

:Temporary SQLite DB:

   Temporary DBs are appropriate when implementing a "pure" transformation in
   terms of SQLite statements. They are easily scaled and have less overhead
   as compared to their stateful peers.

   They operate like stateful DBs, but are fundamentally ephemeral and provide
   no durability guarantees with respect to any internal tables which may be
   populated. As a general rule, transforms *should not* rely on internal tables
   of temporary DBs.

   That said there are **advanced** use cases which can benefit from use of
   temporary tables, such as caching of expensive computations or implementing
   lossy joins. When opting into this feature, be aware that:

   - Internal stable states may disappear at any time.
   - The mapping of group-by key <-> runner DB is unstable,
     and will change as runners are scaled up or down.

Transforms must produce records which conform to the derived collection JSON-Schema_.
If they don't, an error will be raised and the derived collection will cease to
update until either the schema or transform are corrected.

.. _jq: https://stedolan.github.io/jq/
.. _closure: https://en.wikipedia.org/wiki/Closure_(computer_programming)

