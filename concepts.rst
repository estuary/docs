Concepts
=========

Collection
**********

Flow's central concept is a **collection**: an append-only set of immutable JSON
documents. Every collection has an associated schema that documents must
validate against. Collections are either *captured*, meaning documents are
directly added via Flow's ingestion APIs, or *derived* by applying
transformations to other source collections, which may themselves be either
captured or derived. A group of collections are held within a **catalog**.

**Collections are optimized for low-latency processing**.

   As documents are added to a collection, materializations & other derivations which
   use that collection are immediately notified (within milliseconds). This allows Flow
   to minimize end-to-end processing latency.

**Collections are also Data Lakes**.

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

One or more sources are built into a *catalog database* by the ``flowctl``
CLI tool, which is a SQLite database holding a compiled form of the catalog.
Catalog databases are what the Flow runtime actually executes against.

import
------

A goal of catalogs is that they be composable and re-useable: catalog sources
are able to import other sources, and it's recommended that authors structure
their sources in ways that make sense for their projects, teams, and
organization.

The ``import`` stanza is a list of partial or absolute URLs, which are always
evaluated relative to the base directory of the current source.
For example, these are possible imports within a catalog source:

.. code-block:: yaml

    import:
      - sub/directory/flow.yaml
      - ../sibling/directory/flow.yaml
      - https://example/path/flow.yaml

The import rules are designed so that a catalog doesn't have to do anything
special in order to be imported by another source, and flowctl can even
directly build remote sources:

.. code-block:: console

   # Build this documentation repository's Flow catalog.
   $ flowctl build -v --source https://raw.githubusercontent.com/estuary/docs/developer-docs/flow.yaml

JSON schemas also support import semantics via the schema ``$ref`` keyword.
The same import rules apply for JSON Schemas, and it's recommended to directly
reference the authoritative source of an external schema.

flowctl fetches and resolves all catalog and JSON Schema sources at build time,
and the resulting catalog database is a self-contained snapshot
of these resources as they were at the time the catalog was built.

collections
-----------

The ``collections`` stanza is a list of collection definitions within a catalog
source. A collection must be defined before it may be used as a source of
another collection. Sources may also use collections defined in other catalog
sources, but are required to import it (directly or indirectly).

materializationTargets
----------------------

``materializationTargets`` define short, accessible names for target systems --
like SQL databases -- that can be materialized into.

tests
-----

In addition to data expectations carried by schemas, Flow catalogs can also
define functional *contract tests* which verify the integrated end-to-end
behaviors of one or more collections. You'll see examples of these tests
throughout this documentation.

Tests are named and specified by the ``tests`` stanza, and are executed by
the "flowctl test" command. A single test may have one or more steps,
where each step is an ``ingest`` or a ``verify``.

ingest:

    Ingest the given document fixtures into the named collection.
    Documents are required to validate against the collection's schema.

    All of the documents written by an ingest are guaranteed to be processed
    before those of a following ingest. However, documents *within* an
    ingest are written in collection key order. And, if documents within an
    ingest span multiple logical partitions, they may be processed in *any*
    order.

verify:

    Verify runs after all prior "ingest" steps have been fully processed,
    and then compare given document fixtures to the contents of a named collection.

    Comparisons are done using fully combined documents, as if the collection
    under test had been materialized. Notably this means there will be
    only one document for a given collection key, and documents always
    appear in collection key order.

    Test fixture documents are *not* required to represent all properties
    appearing in actual documents, as this can get verbose. Only properties
    which are present in fixture documents are checked.

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

Projections relate columns to JSON hierarchy.

Derivations
***********

A derived collection is built from one or more *source* collections,
each having an applied *transformation*. Source collections may themselves
be either captured or derived, but a derivation cannot directly or
indirectly source from itself.

.. note::

    Formally, collections must represent a directed and acyclic graph.
    This means that Flow processing graphs will always halt_.
    Of course, that doesn't stop you from integrating a service
    which introduces a cycle, if that's your thing.

.. _halt: https://en.wikipedia.org/wiki/Halting_problem

Shuffles
--------

Shuffles do a data shuffle.

Registers
---------

Registers are closures.

Lambdas
-------

Lambdas are mappers.

Transforms
----------

Transform all the things.
