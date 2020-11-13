How Flow Helps
==============

Data Integrity
--------------

| "My pipeline blew up in production because it thought a field wasn't null-able (and it was)."
| "Another team changed their schema, my team didn't realize, and it broke our pipeline."
| "An upstream bug caused my pipeline to read and propagate bad data."
| "I need to update my pipeline. How can I be confident I won't break downstream use cases?"

Data errors and integrity issues are a common problem within larger teams and organizations.
Mistakes are a fact of life, teams don't always communicate proactively, and vendors or partners
may start sending you bad data at any time, making *their* bug *your* problem.

While Flow can't prevent every mistake, it's designed  to identify and surface integrity
issues as quickly as possible -- before bad data has a chance to propagate,
and often before pipelines are even deployed to production.

* Every Flow document has an associated JSON schema, which is verified every time a
  document is read or written. Full stop.

* JSON schema makes it easy to express *validation tests* over data within a document.
  For example, that a latitude is always between -90 and 90 degrees, or that a timestamp
  string is in the right format.

  You can encode expectations that have typically required entire testing
  libraries (e.x. `Great Expectations`_), right into the schema.

  .. _`Great Expectations`: https://greatexpectations.io/

* You can integrate un-trusted sources using an "Extract Load Transform" pattern, where documents
  are first written to a collection with a permissive schema -- ensuring documents are
  never lost -- and are then verified against a more restrictive schema while being transformed.

  If a validation error occurs, Flow halts the pipeline to provide an opportunity for
  the schema and transform to be fixed. The pipeline can then be resumed, and while
  downstream derivations will see a delay, they won't see bad data.

* JSON schema lets you hyperlink directly to the authoritative schema for a data source,
  as provided by another team or a vendor. Upstream schema changes are automatically
  picked up and verified with every catalog build.

* Flow lambdas are strongly typed, using TypeScript types which are drawn from schemas.
  This allows Flow to catch an enormous range of common bugs -- such as typos,
  missing null-able checks, and more -- at catalog build time.

* Flow makes it easy to write *contract test* that verify the integrated, end-to-end
  behavior of multi-stage processing pipelines. Tests can be run during local development
  and within a CI system (e.x. Github Actions or Jenkins).


Historical Replays
------------------

| "I have to back-fill my new streaming pipeline, with replayed historical data"
| "We messed up a dataset or pipeline, and must rebuild with complete history"

Mixing batch and streaming paradigms today often requires manual "replays"
where historical data -- usually stored in a separate batch system -- is fed back
through streaming pub/sub in order to pre-populate a continuous data pipeline.

Getting the ordering semantics and cut-over points right is a tedious, manual process.
It's especially not fun when being undertaken due to a mistake, where there's an
ongoing data outage until it's resolved.

Flow *unifies* batch and streaming data into a single concept -- the *collection* --
that makes it trivial to build (and rebuild) derivations & materialization that
automatically backfill over all historical data, and thereafter transition to
continuous updates.


Unbounded Look-back
-------------------

| "I want to compute a customer's lifetime value from a stream of interactions"
| "I want to join two streams, where events may occur months apart"
| "I want to consider my last 20 customer interactions, no matter when they occurred"

If you've spent time with continuous data systems that offer stream-to-stream joins
(e.x. Flink, Spark, ksqlDB), you've no doubt read quite a bit on their various ways
of expressing windowing semantics for stream-to-stream joins:
event-time windows, hopping windows, rolling windows, session windows, etc.

Each has a slightly different expressions and semantics, but at their core, they're
asking you to scope the portions of the joined streams which they have to consider at
any given time.

This is fine if your problem is of some simpler forms -- e.x. joining events
that closely co-occur -- but the semantics are arbitrary and pretty limiting
in the general case.

Flow uses a simpler and more powerful conceptual model -- the *register* -- which
allows for multi-way streaming joins and aggregations with arbitrary look-back.

With Flow, for example, it's trivial to convert a stream of customer purchases
into a stream of customer lifetime value. Or to join a purchase with the user's
first engagement with that product, over a month ago.


Data Reductions
---------------

| "My PostgreSQL database can't keep up with my event bus."
| "I'm hitting rate limits of my partner or vendor API."
| "I have many frequent events of the same key, that cause performance hot-spots."

Flow is designed so that collection documents can be meaningfully combined
at any time, grouped by the collection key, using *reduction annotations*
of the document's schema.

Within the map/reduce paradigm, "combiners" have long been crucial to building
high-performance pipelines, because they can substantially reduce the data
volumes which must be written to disk, sent, sorted, and reduced at
each pipeline stage.

Flow is unique in that it brings automatic combiners to the domain of
continuous data processing. Documents are combined "early and often":
when being ingested, derived, and materialized.
Users are free to publish lots of small documents, without concern to the
performance cost of doing so.

When materializing a rolled-up view, the target system only needs to be fast
and large enough to process updates of the roll-up -- and *not* the inputs
that built it. As a materialization target -- database, API, or stream
-- becomes busier or slower, Flow becomes more efficient at a combining
more inputs into fewer writes to the target system.


Evolving Requirements
---------------------

| "I want to alter a calculation in my transform..."
| "I want to join a new dataset into an existing transform..."
| "I want to tweak how events are windowed..."
|    "... without having to rebuild from scratch."

Requirements tend to change over time, and Flow's *derived collections* are
designed to evolve with them. Add or remove transforms, update the register
schema, or tweak lambda implementations, and the new behavior will be used
on a go-forward basis -- without having to completely rebuild the view,
which can be expensive, involve downtime, and manual downstream migrations.

Of course if you *do* want to rebuild, that's easy too.

Some tools for continuous data processing (e.x. Spark, Flink, ksqlDB,
Materialize) offer SQL as a primary means of defining transformations.
While SQL is a wonderful query language, it's not a great fit for long-lived
transforms with evolving requirements (e.x. left-join against a new dataset).


Versioned Documentation
-----------------------

| "I don't know what data products are available within my organizations."
| "How do I start using data produced by another team?"
| "I need to understand how this metric is derived."

Flow catalogs are completely declarative, and are designed to be cooperatively
developed by multiple self-service teams, coordinating through version control.

This means that everyone has a complete description of the data products
managed by the organization in their git checkout, and can quickly start
developing, locally running, and testing new data products that build off
of their teammate's work.

In the near future, the Flow tooling will also generate human-friendly
documentation for exploring a catalog, that can integrate directly
into Github pages and be versioned with your repo. This keeps product,
analyst, and business stakeholders "in the loop" with comprehensive
documentation that updates as part of the engineering workflow.


Cheap Stream-to-Stream Joins
----------------------------

| "I have a huge stream to join, and it's expensive to index!"

A canonical example is joining advertising "views", of which there are many,
with a later "click", of which there are very few, joined over a common
impression ID.

Typically this is done -- either explicitly, or under the hood as part of
an execution plan -- by processing the view event first, and indexing it
within a local state store on the impression ID. Then, should a click event
come, it's matched against the indexed view and emitted.

But while local state stores are typically very fast and cheap to *read*,
**mutating** state is perhaps the *most expensive* operation in a continuous
data pipeline, due to the replication required under the hood. Flow goes to
great lengths to make this efficient, but there are hard limits around
transaction boundaries.

Flow lets you flip the problem on its head, by indexing current *clicks*
and joining against *views* read with, say, a 5 minute delay.
This is far more efficient: an order of magnitude fewer local state
mutations, paired with cheap delayed reads to match each view
against a potential indexed click.


Tyranny of Partitioning
-----------------------

| "Our topic has N partitions, but we've grown and now that's not enough"

Some systems (e.x. Kafka, Pulsar, Kenesis) require that you declare how many
partitions a topic has. On write, each event is then hashed to a specific
partition using its key. When reading, one consumer "task" is then created
(usually, automatically) for each partition of the topic. Consumers leverage
the insight that all events of a given key will be in the same partition.

This makes the choice of partitions a *crucial* knob. For one, it bounds the
total read and write rate of the topic, though usually that isn't the primary
concern. What is, is that the number of partitions determines the number of
consumer tasks, and the number of associated task "state stores" --
stores that hold inner transformation state like event windows and partial
aggregates.

If those stores grow too large you *can't* simply increase the number of
topic partitions, because that invalidates all stateful stream processors
reading the topic (by breaking the assumption that all instances of a key
are in the same partition).

Instead, standard practice is to perform an expensive manual re-partitioning,
where the topic -- in it's entirety -- is copied into a new topic with updated
partitioning, and downstream transformations are then rebuilt.

Flow **completely** avoids these issues. Collection partitions and derivation
tasks are decoupled from one another, and can be scaled independently as needed
and without downtime. In the future, scaling will be fully automated.