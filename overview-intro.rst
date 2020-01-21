
Introduction
=============

Estuary powers 


deploy real time pipelines and backends that handle adding schema, transformations and aggregations solely by writing SQL, jq and JSON Schema.  


Concepts
=========

Collections
************

An Estuary **Collection** is an append-only set of immutable *records*. Records are
JSON documents, and each must be valid to the collection's associated JSON-Schema_.
Schemas may impose no structure, may be rigourously specified, or fall anywhere in
between. They may also evolve over time, though not in such a way that they
invalidate records already part of the collection.

**Collections are optimized for stream processing**.

   Many publishers can concurrently append new records at high volumes.
   The current readers of a collection are notified of new records within milliseconds.

**Historical records are regular files in cloud storage (S3)**.

   Collections organize, index, and store records within a Hive-compatible file hierarchy
   implemented using only cloud storage. Files themselves hold record content (eg, JSON lines)
   with no special formatting, and can be directly read using preferrred tools and
   workflows -- including Map/Reduce, Spark, Snowflake, and BigQuery.

**Collections are a long-term source of truth**.

   New readers efficiently "backfill" over all existing records of the collection,
   then seamlessly transition to tailing newly-added records in real-time.

**A collection is either *prime* or *derived***.

   A *prime* collection is one into which records are directly written.
   Estuary provides a ingestion APIs for adding events to prime collections.
   An API service might publish events from live serving via HTTP PUTs,
   or an AWS lambda might stream in Kenisis events.

   *Derived* collections are declared in terms of source collections and
   transformations to apply, and are akin to a materialized view in a database--
   a view which is continously updated as source collections change.

**They may be explicitly and/or automatically partitioned**.
 
   An explicit partition segregates records of a collection based on a record value
   specified via JSON-Pointer_. For example, a collection of market updates might
   partition on the market exchange (``NYSE``, ``NASDAQ``, etc).

   Automatic partitions are managed by Estuary, and allow collections to scale up to
   arbitrary record volumes. 

   Files of partitioned collections are organized within cloud storage using a
   Hive-compatible layout, making them interpretable as external tables by tools
   that understand Hive partitioning and predicate push-down (eg, Snowflake,
   BigQuery, and Hive itself).

**They may declare a *primary key***.

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
of JSON documents. Schemas are composable and flexibile, and may include conditionals
and dependencies that make it possible to represent `tagged unions`_ and other complex,
real-world composite types.

The standard also formalizes a concept of "Annotations_" through which schemas can
conditionally attach metadata within a validated JSON document. For example, a schema
validating a union type might attach `description` annotations to certain fields
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

Using a collection might seem rather round-about for a simple a key/value map--why not just
use DynamoDB or Memcached directly, and call it a day?--but its advantage becomes clear
as soon as one wants *both* DynamoDB and Memcached, or indexes in multiple clouds or regions,
or wants to study how keys have changed over time. A collection can be read over and over
again, now or in the future, without any coordination or operational risk to production
infrastructure, and every reader will materialize the *exact same state*.


Materializations
*****************

Estuary does much of the heavy lifting when materializing states from collections, and can
automatically load collections into a number of common database, indexes, and SaaS tools.
The JSON-Schema_ of the collection is used to derive and create appropriate table schemas
in the target system.

Collections without a key are loaded one-for-one into the target system. It gets more
interesting when materializing a collection that's declared with a primary key:

- Records of the collection are interpreted as modelng a mutable state of the key.
  For example, a key might compose dimensions of a fact table, or be a user name,
  or a blog post ID.

  When materializing into a database or index, collection records are *mapped* to
  corresponding relation rows or key/value entries by the record key.

- Records also have a well-defined *reduction* operation for producing updated states.
  We've discussed one example already--map updates are reduced by taking the last value
  written for a given key--but much more sophisticated reductions can be expressed.
  Reductions might update metrics of a fact table, or accumulate friend connections
  in a social graph, or track top comments of blog posts.

  When materializing, the current mapped value is *read* and is then *modified* by
  reducing new records into its present value.

Materializations are very efficient, even when materializating a high-volume collection.
The load imposed on a target system is proportional to the rate by which the
materialization itself changes, and **not** to the underlying record rate of the
collection. A tiny PostgreSQL database can easily support a summary--in real time--
of a collection with millions of record updates per second, so long as the summary
itself easily fits within the database.

.. note::

   A key property of reductions over collections is that they're always associative
   (formally, `a.(b.c) = (a.b).c`).
   
   Estuary leverages this property to significantly reduce record volumes early on
   within processing pipelines -- intutively, in a similar way to how Map/Reduce
   leverages Combiners. This practice lets Estuary easily handle collections
   with Zipfian_ primary key distributions.

.. _Zipfian: https://en.wikipedia.org/wiki/Zipf%27s_law


Reduce Keyword
***************

Estuary extends the JSON-Schema_ vocabulary with an additional ``reduce`` keyword,
which annotates how locations within a validated JSON document may be reduced
into another document. A variety of reduction strategies are supported:

:``lastWriteWins``: 
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
   sub-field of the current JSON value which is to be compared. If ommitted,
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
         "schema": { "reduce": { "strategy": "minimize", "ptr": "/val" } },
         "reduce": { "val":  "10", "other": "data" },
         "into":   { "val":  "20", "three": 4 },
         "output": { "val":  "10", "other": "data" }
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
         "reduce": { "value": "my-item" },
         "into":   { "hll": "... serialized HLL ..." },
         "output": { "hll": "... updated serialized HLL ..." }
      }

:``tDigest``:
   Fold a number into a T-Digest, or merge two digests.

   Applies to ``object`` types, with further restrictions on
   expected object properties.

   .. code-block:: json

      {
         "schema": { "reduce": "tDigest" },
         "reduce": { "value": 150.372 },
         "into":   { "td": "... serialized T-Digest ..." },
         "output": { "td": "... updated serialized T-Digest ..." }
      }

.. note::

    Estuary intends to support a range of probabilistic sketches with reduce
    annotations, but details may change. For example, reduce annotations
    may introduce sketch "flavors" which are designed for compatibility with
    equivalents in target systems of interest, such as BigQuery or Snowflake
    HLL's, etc.


Transformations
****************

A derived collection is declared by pairing one or more *source* collections
with *transformation functions*. Transformations are invoked with input
records of the source collection schema, and must output records of the derived
collection. Generally transformations fall into two camps: "pure" functions,
which produce output records that depend only on the current input record,
and closure_ functions, which maintain an internal state which is read and
updated as input records are encountered.

Estuary is a distributed system, and transformations are often run by many
parallel "runners". Pure functions are easy to scale up and down, and Estaury
automatically manages their parallelism.

Closures also run in parallel, but the output of a closure may depend on the
current record as well as *all previous* input records of the closure. For
this reason closures must declare a fixed number of "shards", which are each
independent instances of the closure's inner state.

The number of shards
upper-bounds the maximum parallelism of the closure. However, too many shards
increases coordination and can slow things down.




desired partitioning, which 


must be fixed and determined ahead of
time



Closures may also be senstive to the keys
by which inputs





Several ways of specifying transformation functions are supported.
Many transformations are "pure" functions, which means that an output
depends only on its current input record.

Estuary also provides closure_ transformations which "close" over an
internal and local state. Closures can be used to implement change
detection, windowing, joins, and other complex event processing patterns.

:jq_ filters:

   "jq" is a swiss army knife for working with JSON documents.
   Use jq filters to transform, filter, and project JSON documents from
   one schema into another.

:SQLite pure function:

   Specify transformations in terms of one or more SQL statements which read
   records from a provided ``input`` table and write to provided ``output`` table
   (table definitions are derived from the respective JSON-Schema_).

   Pure SQLite functions run within SQLite ":memory:" databases, with arbitrary
   parallelism. Database may come & go at any time. Functions are given an
   opportunity to "bootstrap" their database at startup, and nothing stops

  
   but no reliance should be made on
   the durability of internal table rows written by the program. 
 
:SQLite closures:

   SQLite closures resemble SQLite functions, but close_ over a local
   state expressed as one or more associated tables.

   




.. _closure: https://en.wikipedia.org/wiki/Closure_(computer_programming)


:Remote HTTP Endpoint:

   Use an AWS lambda as a transformation. The function must accept one or more
   input records via HTTP PUT, and respond with one or more output records.



Lambdas must produce records which conform to the derived collection JSON-Schema_.
If they don't, an error will be raised and the derived collection will cease to
update until either the schema or function are corrected.



If a derived collection is specified with a primary key, Estuary will efficiently
reduce instances of the output schema produced by transformations. This means that
powerful and efficient aggregations can be instrumented by simply *projecting*
each source record into the corresponding output shape.


.. _jq: https://stedolan.github.io/jq/







Optionally, records of source collections
are re-grouped using a *group-by* key, which may differ from the source's primary
key (or the source may have no primary key).




