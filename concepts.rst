Concepts
=========

Collection
**********

Flow's central concept is a **collection**: an append-only set of immutable JSON
documents. Every collection has an associated schema that documents must
validate against. Collections are either *captured*, meaning documents are
directly added via Flow's ingestion APIs, or they're *derived* by applying
transformations to other source collections, which may themselves be either
captured or derived. A group of collections are held within a **catalog**.

**Collections are optimized for low-latency processing**.

   As documents are added to a collection, materializations & other derivations which
   use that collection are immediately notified (within milliseconds). This allows Flow
   to minimize end-to-end processing latency.

**Collections are "Data Lakes"**.

   Collections organize, index, and durably store documents within a hierarchy of files
   implemented atop cloud storage. These files are Flow's native, source-of-truth
   representation for the contents of the collection, and can be managed and deleted
   using regular bucket life-cycle policies.

   Files hold collection documents with no special formatting (eg, as JSON lines),
   and can be directly processed using Spark and other preferred tools.

**Collections can be of unbounded size**.

   The Flow runtime persists data to cloud storage as soon as possible,
   and uses machine disks only for temporary data & indexes.
   Collection retention policies can be driven only by your organizational
   requirements –- not your available disk space.

   A new derivation or materialization will efficiently back-fill over all
   collection documents -- even where they span months or even years of data --
   by reading directly out of cloud storage.

   Crucially, a high scale back-fill that sources from a collection doesn't compete
   with and cannot harm the collection's ability to accept new writes, as reads
   depend *only* on cloud storage for serving up historical data. This is a
   guarantee that's unique to Flow, through its Gazette-based architecture.

**Collections may have logical partitions**.

   Logical partitions are defined in terms of a JSON-Pointer_: i.e., the pointer
   ``/region`` would extract a partition value of "EU" from collection document
   ``{"region": "EU", ...}``.

   Documents are segregated by partition values, and are organized within cloud storage
   using a Hive-compatible layout. Partitioned collections are directly interpretable as
   external tables by tools that understand Hive partitioning and predicate push-down
   -- like Snowflake, BigQuery, and Hive itself.

   Each logical partition will have one or more *physical* partitions, backed by a
   corresponding Gazette journal. Physical partitions are largely transparent to
   users, but enable Flow to scale out processing as the data-rate increases, and
   may be added at any time.

**Collections must have a declared key**.

   Keys are specified as one or more JSON-Pointer_ locations.
   When materializing a collection, its key carries over to the target system,
   and a key with more than one location becomes a composite primary key in SQL.

   Collections are immutable, so adding a document doesn't *erase* a prior document
   having the same key -- all prior documents are still part of the collection.
   Rather, it reflects an *update* of the key, which by default will flow through to
   replace the value indexed by a materialization. Far richer semantics are possible
   by using *reduction annotations* within the collection's schema.

.. _JSON-Pointer: https://tools.ietf.org/html/rfc6901


Catalogs
********

Flow uses YAML or JSON source files, called *catalog sources*, to define the
various entities which Flow understands (collections, schemas, tests, etc).

One or more sources are built into a *catalog database* by the ``flowctl build``
CLI tool. Catalog databases are SQLite files holding a compiled form of the catalog,
and are what the Flow runtime actually executes against.

Catalog sources are divided into sections.

**import** section
------------------

A goal of catalogs is that they be composable and re-useable: catalog sources
are able to import other sources, and it's recommended that authors structure
their sources in ways that make sense for their projects, teams, and
organization.

The ``import`` section is a list of partial or absolute URLs, which are always
evaluated relative to the base directory of the current source.
For example, these are possible imports within a catalog source:

.. code-block:: yaml

    # Suppose we're in file "/path/dir/flow.yaml"
    import:
      - sub/directory/flow.yaml        # Resolves to "file:///path/dir/sub/directory/flow.yaml".
      - ../sibling/directory/flow.yaml # Resolves to "file:///path/sibling/directory/flow.yaml".
      - https://example/path/flow.yaml # Uses the absolute url.

The import rules are designed so that a catalog doesn't have to do anything
special in order to be imported by another source, and flowctl can even
directly build remote sources:

.. code-block:: console

   # Build this documentation repository's Flow catalog.
   $ flowctl build -v --source https://raw.githubusercontent.com/estuary/docs/developer-docs/flow.yaml

JSON schemas have a ``$ref`` keyword, by which local and external schema URLs may be
referenced. Flow uses these same import rules for resolving JSON schemas, and it's
recommended to directly reference the authoritative source of an external schema.

flowctl fetches and resolves all catalog and JSON Schema sources at build time,
and the resulting catalog database is a self-contained snapshot
of these resources *as they were* at the time the catalog was built.

**collections** section
-----------------------

The ``collections`` section is a list of collection definitions within a catalog
source. A collection must be defined before it may be used as a source within
another collection.

Derived collections may also reference collections defined in other catalog sources,
but are required to first import them (directly or indirectly).

**materializationTargets** section
----------------------------------

``materializationTargets`` define short, accessible names for target systems --
like SQL databases -- that can be materialized into.

They encapsulate connection details and configuration of systems behind a
memorable, authoritative name. See Materializations_ for more.

**tests** section
-----------------

Flow catalogs can also define functional *contract tests* which verify the
integrated end-to-end behaviors of one or more collections. You'll see
examples of these tests throughout this documentation.

Tests are named and specified by the ``tests`` section, and are executed by
the "flowctl test" command against a local instance of the Flow runtime.
A single test may have one or more steps, where each is one of:

**ingest**:

    Ingest the given document fixtures into the named collection.
    Documents are required to validate against the collection's schema.

    All of the documents written by an ingest are guaranteed to be processed
    before those of a following ingest. However, documents *within* an
    ingest are written in collection key order.

**verify**:

    Verify runs after all prior "ingest" steps have been fully processed,
    and then compares provided fixtures to the contents of a named collection.

    Comparisons are done using fully combined documents, as if the collection
    under test had been materialized. Notably this means there will be
    only one document for a given collection key, and documents always
    appear in collection key order.

    Test fixture documents are *not* required to have all properties
    appearing in actual documents, as this can get pretty verbose.
    Only properties which are present in fixture documents are compared.

Schemas
*******

Flow makes heavy use of `JSON Schema`_ to describe the expected structure and
semantics of JSON documents. If you're new to JSON Schema, it's an expressive
standard for defining JSON: it goes well beyond basic type information, and can
model `tagged unions`_, recursion, and other complex, real-world composite types.
Schemas can also define rich data validations like minimum & maximum values,
regular expressions, date/time/email & other formats, and more.

Together, these features let schemas represent structure *as well as* expectations
and constraints which are evaluated and must hold true for every collection
document, *before* it's added to the collection. They're a powerful tool for
ensuring end-to-end data quality: for catching data errors and mistakes early,
before they can cause damage.

.. note:

   Flow has full support for the current JSON-Schema specification (`draft 2019-09`_),
   which is also used by OpenAPI v3.1+.

   .. _`draft 2019-09`: https://json-schema.org/specification.html

.. _`JSON Schema`: https://json-schema.org/understanding-json-schema/

.. _`tagged unions`: https://en.wikipedia.org/wiki/Tagged_union

Inference
---------

A central design tenant of Flow is that users need only provide a modeling of
their data *one time*, as a JSON schema. Having done that, Flow leverages static
inference over the schema to provide translations into other schema flavors:

* Most Projections_ of a collection are automatically inferred from its schema,
  for example, and inference is used to map to appropriate SQL types and constraints.

* Inference powers many of the error checks Flow performs when building
  the catalog, such as ensuring that the collection key must exist and is
  of an appropriate type.

* Flow generates TypeScript definitions from schemas, to provide compile-time
  type checks of user lambda functions. These checks are immensely helpful for
  surfacing mismatched expectations around e.g. whether a field must exist,
  which otherwise usually blow up in production.

Reduction Annotations
---------------------

JSON Schema introduces a concept of "Annotations_", which allow schemas to attach
metadata at locations within a validated JSON document. For example, ``description``
can be used to describe the meaning of a particular property:

.. _Annotations: https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.7.7

.. code-block:: yaml

    properties:
        myField:
            description: "A description of myField"

Flow extends JSON Schema with *reduction annotations*, which define how one
document is to be combined into another. Here's a counter:

.. code-block:: yaml

    type: object
    reduce: {strategy: merge}
    properties:
        myValue:
            type: number
            reduce: {strategy: sum}

    # combine({ "myValue": 1 }, { "myValue": 2 }) => { "myValue": 3 }

What's especially powerful about annotations is that they respond to *conditionals*
within the schema. A tagged union type might alter the ``description`` of a property
depending on which variant of the union type was matched. This also applies to
reduction annotations, which can use conditionals to compose richer behaviors.
For example, here's a reset-able counter:

.. literalinclude:: reductions/reset_counter.flow.yaml
   :language: yaml

Reduction annotations are a Flow super-power. They make it easy to define
*combiners* over arbitrary JSON documents, and they allow Flow
to employ those combiners early and often within the runtime -- regularly
collapsing a torrent of ingested documents into a trickle.

.. note::

    Flow never delays processing in order to batch or combine more
    documents, as some systems do (commonly known as *micro-batches*,
    or time-based *polling*). Every document is processed as quickly
    as possible, from end to end.

    Instead, Flow uses optimistic transaction pipelining to do as much
    useful work as possible, while it awaits the commit of a previous
    transaction. This natural back-pressure affords *plenty* of
    opportunity for data reductions, while minimizing latency.

    In other words, as a target database becomes busier or slower,
    Flow becomes more efficient at combining many documents into few
    table updates.

Projections
***********

Flow documents are arbitrary JSON, and may contain multiple levels of hierarchy and nesting.
However, systems that Flow integrates with often model flattened tables with rows and
columns, but no nesting. Others are somewhere in between.

**Projections** are the means by which Flow translates between the JSON documents of a
collection, and a table representation. A projection defines a mapping between a structured
document location (as a `JSON-Pointer`_) and a corresponding column name (a "field") in,
e.g., a CSV file or SQL table.

Many projections are inferred automatically from a collection's JSON Schema, using a field
which is simply the JSON-Pointer with its leading slash removed. For example, a schema
scalar with pointer ``/myScalar`` will generate a projection with field ``myScalar``.

Users can supplement by providing additional collection projections, and a document location
can have more than one projection field that references it.
Projections are also how logical partitions of a collection are declared.

Some examples:

.. code-block:: yaml

    collections:
    - name: example/sessions
        schema: session.schema.yaml
        key: [/user/id, /timestamp]
        projections:
            # A "user/id" projection field is automatically inferred.
            # Add an supplemental field that doesn't have a slash.
            user_id: /user/id
            # Partly decompose a nested array of requests into a handful of named projections.
            "first request": /requests/0
            "second request": /requests/1
            "third request": /requests/2
            # Define logical partitions over country and device type.
            country:
                location_ptr: /country
                partition: true
            device:
                location_ptr: /agent/type
                partition: true

Logical Partitions
------------------

A logical partition of a collection is a projection which physically segregates
the storage of documents by the partitioned value. Derived collections can
in turn provide a *partition selector* which identifies a subset of partitions
of the source collection that should be read:

.. code-block:: yaml

    collections:
    - name: example/derived
      derivation:
        transform:
            fromSessions:
                source:
                    name: example/sessions
                    partitions:
                        include:
                            country: [US, CA]
                        exclude:
                            device: [Desktop]

Partition selectors are very efficient, as they allow Flow to altogether avoid
reading documents which aren't needed by the derived collection.

Partitions also enable *predicate push-down* when directly processing collection
files using tools that understand Hive partitioning, like Snowflake, BigQuery, and Spark.
Under the hood, the partitioned fields of a document are applied to name and
identify the `Gazette journal`_ into which the document is written, which in turn
prescribes how journal `fragment files`_ are arranged within cloud storage.

For example, a document of "example/sessions" like
``{"country": "CA", "agent": {"type": "iPhone"}, ...}``
would map to a Gazette journal prefix of
``example/sessions/country=CA/device=iPhone/``,
which in turn produces fragment files in cloud storage like:
``s3://bucket/example/sessions/country=CA/device=iPhone/pivot=00/utc_date=2020-11-04/utc_hour=16/<name>.gz``.

Tools that understand Hive partitioning are able to take query predicates over "country",
"device", or "utc_date/hour" and push them "down" into the selection of files
which must be read to answer the query -- often offering much faster query
execution because far less data must be read.

.. note::

    "pivot" identifies a *physical partition*, while "utc_date" and "utc_hour"
    reflect the time at which the journal fragment was created.

    Within a logical partition there are one or more physical partitions,
    each a Gazette journal, into which documents are actually written.
    The logical partition prefix is extended with a "pivot" suffix to arrive
    at a concrete journal name.

    Flow is designed so that physical partitions can be dynamically added
    at any time, to scale the write & read throughput capacity of a collection.

.. _`Gazette journal`: https://gazette.readthedocs.io/en/latest/brokers-concepts.html#journals
.. _`fragment files`: https://gazette.readthedocs.io/en/latest/brokers-concepts.html#fragment-files


Ingestion
*********

Flow offers a variety of ingestion APIs for adding documents into captured collections:
gRPC, WebSocket streams of JSON or CSV, and POSTS of regular JSON over HTTP.

Ingestion within Flow is transactional. For example, the JSON POST API accepts
multiple documents and collections to which they're written, and returns only
after the ingestion has fully committed. If a fault occurs, or a document fails
to validate against its collection schema, than the ingestion is rolled back in
its entirety.

Many data sources are continuous in nature. Flow provides WebSocket APIs for use
by browser agents, API servers, log sources, and other connected streaming systems.
Documents sent on the WebSocket streamed are collected into transaction windows,
and Flow regularly reports back on progress as transactions commit.

.. note::

    Estuary has plans for additional means of ingestion, such as Kenesis and
    Kafka integrations, as well as direct Database changed data capture.

    What's implemented today is a minimal baseline to enable early use cases.


Derivations
***********

A derived collection is built from one or more *transforms*,
where each transform reads a *source* collection and applies mapping
*lambda* functions to its documents.

The transforms of a derivation are able to share state with each other
through derivation *registers*, which are JSON documents that
transformations can read and update. The applicable register is keyed
by a data *shuffle* defined by each transform, extracted from its
source documents.

Sources
-------

A source is an "upstream" collection being consumed by a derived collection.
It source collection can itself be either captured or derived. However,
a derived collection cannot directly or indirectly source from itself.

In other words, collections must represent a directed acyclic graph
(not having any loops), such that document processing will always halt_.
Of course, that doesn't stop you from integrating a service
which adds a cycle, if that's your thing.

.. _halt: https://en.wikipedia.org/wiki/Halting_problem

Sources can specify a selector over partitions of the sourced collection,
which will restrict the partitions which are read. Selectors are efficient,
as they allow Flow to altogether avoid reading data that's not needed,
rather than performing a read and then filtering it out.

Collection schemas may evolve over time, and documents read from the source
are re-validated against the current collection schema to ensure they
remain valid. A schema error will halt the execution of the derivation,
until the mismatch can be corrected.

Sources can optional provide an alternative *source schema* to use.
This is helpful if the sourced collection reflects an external
data source that the user doesn't have control over, and which may
evolve its schema over time.

In this case, the captured collection can use a permissive schema that
ensures documents are never lost, and the derived collection can then
assert a stricter source schema. In the event that source documents violate
that schema, the derivation will halt with an error. The user is then able
to update their schema and transformations, and continue processing
from where the derivation left off.

Lambdas
-------

Lambdas are anonymous `pure functions`_ taking documents and returning zero,
one, or more output documents. In map/reduce terms lambdas are "mappers",
and the Flow runtime performs combine and reduce operations using the
reduction annotations provided with schemas.

.. _`pure functions`: https://en.wikipedia.org/wiki/Pure_function

The Flow runtime manages the execution contexts of lambdas, and a derivation
may be scaled out to many contexts running over available machines.
Assignments and re-assignments of those contexts are automatic, and the
runtime maintains "hot" standbys of each context for fast fail-over.

Under the hood, lambda execution contexts are modeled as *shards*
within the Gazette `consumers framework`_.

.. _`consumers framework`: https://gazette.readthedocs.io/en/latest/consumers-concepts.html#

Lambda functions are typed by the JSON schemas which constitute their inputs
and outputs. Output documents are validated against expected schemas,
and an error will halt execution of the derivation.
Where applicable, Flow will also map JSON schemas into corresponding types in
the lambda implementation language, facilitating static type checks during
catalog builds.

Today, Flow supports:

:TypeScript:

    TypeScript_ is typed JavaScript that compiles to regular JavaScript during
    catalog builds, which Flow then executes on the NodeJS_ runtime.
    JSON Schemas are mapped to TypeScript types with high fidelity,
    enabling succinct and performant lambdas with rigorous type safety.
    Lambdas can also take advantage of the NPM_ package ecosystem.

    .. _TypeScript: https://www.typescriptlang.org/
    .. _NodeJS: https://nodejs.dev/
    .. _NPM: http://npmjs.com/

:Remote Endpoint:

    Remote endpoints are URLs which Flow invokes via JSON POST, sending batches
    of input documents and expecting to receive batches of output documents in return.

    They're a means of integrating other languages and environments into a Flow derivation.
    Intended uses include APIs implemented in other languages, running as "serverless"
    functions (AWS lambdas, or Google Cloud Functions).

Flow intends to support a wider variety of lambda languages in the future,
such as Python, SQLIte, and jq_.

.. _jq: https://stedolan.github.io/jq/


Registers
---------

A register is an arbitrary JSON document which is shared between the various
transformations of a derivation. It allows those transformations to communicate with one
another, through updates of the register's value. Registers enable the full gamut of
stateful processing workflows, including all varieties of joins and custom
windowing semantics over prior events.

Like collections, the registers of a derivation always have an associated JSON schema.
That schema may have reduction annotations, which are applied to fold updates
of a register into a fully reduced value.

Each source document is mapped to a corresponding register using the transform's
*shuffle*, and a derivation may have **lots** of distinct registers. Flow manages
the mapping, retrieval, and persistence of register values.

Under the hood, registers are backed by replicated, embedded RocksDB instances which
co-locate 1:1 with the lambda execution contexts that Flow manages.
As contexts are assigned and re-assigned, their DBs travel with them.

If any single RocksDB instance becomes too large, Flow is able to perform an
online "split" which subdivides its contents into two new databases (and
paired execution contexts), re-assigned to other machines.


Shuffles
--------

Transformations may provide a shuffle key as one or more JSON-Pointer_ locations,
to be extracted from documents of the transform's sourced collection. If multiple
pointers are given, they're treated as an ordered composite key. If no key is
provided, the source's collection key is used instead.

During processing, every source document is mapped through its shuffle key to
identify an associated register. Multiple transformations can coordinate with one
another by selecting shuffle keys which reflect the same identifiers -- even if
those identifers are structured differently within their respective documents.

For example, suppose we're joining two collections on a user accounts: one transform
might use a shuffle key of [/id] for "account" collection documents like ``{"id": 123, ...}``,
while another uses key [/account_id] for "action" documents like ``{"account_id": 123, ...}```.
In both cases the shuffled entity is an account ID, and we can implement a left-join
of accounts and their actions by *updating* the register with the latest "account" document,
and *publishing* "action" documents enriched by the latest "account" stored in the register.

At catalog build time, Flow checks the shuffle keys align on their composition
and schema types.

Shuffle keys are named as they are because, in many cases, a physical "data shuffle"
must occur where Flow redistributes source documents to the execution contexts that
are responsible for their associated registers. This is a well known concept in the
data processing world, and "shuffle" acknowledges and ties the role of a shuffle key
to this concept. However, data shuffles are transparent to the user, and in many
cases Flow can avoid them altogether.


Transforms
----------

Transforms put sources, shuffles, registers, and lambdas all together:
transforms of a derivation specify a source and (optional) shuffle key,
and may have either or both of an *update* lambda and a *publish* lambda.

"Update" lambdas update the value of a derivation register. These lambdas
are invoked with a source document as their only argument, and return zero, one,
or more documents which are then reduced by Flow into the current register value.

"Publish" lambdas publish new documents into a derived collection. Publish
lambdas run *after* an update lambda of the transformation, if there is one.
They're invoked with a source document, its current register value, and its
previous register value (if applicable). In turn, publish lambdas return zero,
one, or more documents which are then incorporated into the derived collection.

Note that documents returned by publish lambdas are not *directly* added to
collections. They're first reduced by Flow into a single document update for
each encountered unique key of the derivation, within a given processing
transaction. In map/reduce terms, this is a "combine" operation, and it's
a powerful data reduction technique. It means that "publish" lambdas can
return many small documents with impunity, confident that the runtime will
combine their effects into a single published document.

To accomplish a stateful processing task, generally an "update" lambda will
update the register to reflect one or more encountered documents of interest
(often called a *window*), using reduction annotations that fold semantically
meaningful updates into the register's value for each document. This might
mean storing a last-seen value, updating counters, sets, or other structures,
or simply storing a bounded array of prior documents wholesale.

A "publish" lambda will then examine a source document, its current register,
and prior register. It might filter documents, or compose portions of the
source document & register. It can compare the prior & current registers to
identify meaningful inflections, such as when a sum transitions between negative
and positive. Whatever its semantics, it takes action by returning documents
which are combined into the derived collection.

One might wonder why "update" lambdas aren't invoked with / allowed to examine
the present register. The short answer is "performance". If update lambdas
received a current register value then that implies that, for a given shuffle key,
update lambdas must be invoked in strict sequential order. This could be *very*
slow, especially if each invocation requires network round trips (e.g. with
remote lambdas). Instead, Flow's formulation of "update" and "publish" allows the
runtime to process large windows of source documents through "update" or "publish"
concurrently, even where many may share a common shuffle key.

.. note::

    While Flow is an event-driven system, the update/publish formulation has
    a direct translation into a traditional batch map/reduce paradigm, which Flow
    may offer in the future for even faster back-fills over massive datasets.


Materializations
****************

Write me.