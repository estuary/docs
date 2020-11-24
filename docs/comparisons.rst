.. _comparisons:

Comparisons
===========

Flow is unique in the continuous processing space.
It has similarities to, and is at the same time wholly unlike a
number of other systems & tools.


Google Cloud Dataflow
---------------------

Flow's most apt comparison is to Google Cloud Dataflow (aka Apache Beam),
with which Flow has the most conceptual overlap.

*Like* Beam, Flow's primary primitive is a *collection*. One builds a processing graph
by relating multiple collections together through procedural transformations (aka lambdas).
As with Beam, Flow's runtime performs automatic data shuffles, and is designed to allow
for fully automatic scaling. Also like Beam, collections have associated schemas.

*Unlike* Beam, Flow doesn't distinguish between "batch" and "streaming" contexts.
Flow unifies these paradigms under a single *collection* concept.

Also, while Beam allows for optionally user-defined combine operators,
Flow's runtime *always* applies combine operators built using the declared
semantics of the document's schema.

Finally, Flow allows for stateful stream-stream joins without the "window-ization"
semantics imposed by Beam. Notably, Flow's modeling of state -- via it's per-key
*register* concept -- is substantially more powerful than Beams "per-key-and-window"
model. For example, registers can trivially model the cumulative lifetime value of
a customer.


PipelineDB / ksqlDB / Materialize
---------------------------------

ksqlDB and Materialize are new SQL databases which focus on streaming
updates of materialized views. PipelineDB was a PostgreSQL extension which,
to our knowledge, pioneered in this space (and deserves more credit!).

Flow is not -- nor does it want to be -- a database. It aims to
enable all of your *other* databases to serve continuously materialized
views. Flow materializations use the storage provided by the target database
to persist the view's aggregate output, and Flow focuses on mapping,
combining, and reducing in updates of that aggregate as source
collections change.

While Flow tightly integrates with the SQL table model (via *projections*),
Flow can also power document stores like Elastic and CosmosDB, that deal in
Flow's native JSON object model.


BigQuery / Snowflake / Presto
-----------------------------

Flow is designed to integrate with Snowflake and BigQuery by adding
Flow collections as external, Hive-partitioned tables within these
systems.

First Flow is used to capture and "lake" data drawn from a pub/sub
topic, for which Flow produces an organized file layout of compressed
JSON in cloud storage. Files are even named to allow for Hive predicate
push-down (ex "SELECT count(*) where utc_date = '2020-11-12' and region = 'US'),
enabling substantially faster queries.

These locations can then be defined as external tables in Snowflake
or BigQuery -- and in the near future, we expect Flow will even produce
this SQL DDL.

For data which is read infrequently, this can be cheaper than directly
ingesting data into Snowflake or BigQuery -- you consume no storage or
compute credits until you actually query data.

For frequently read data, a variety of options are available for
materializing or post-processing for native warehouse query performance.


dbt
---

dbt is a tool that enables data analysts and engineers to transform
data in their warehouses more effectively. As they say, that's their
elevator pitch.

In addition to -- and perhaps more important than -- it's transform
capability, dbt brought an entirely new workflow for working with
data. One that prioritizes version control, testing, local development,
documentation, composition and re-use.

Fishtown Analytics should take it as sincere complement that Flow's
declarative model and tooling has as many similarities as it does,
as dbt provided significant inspiration.

However, there the similarities end. dbt is a tool for defining
transformations, executed within your analytics warehouse.
Flow is a tool for delivering data to that warehouse, as well as
continuous *operational* transforms that are applied everywhere else.

They can also make lots of sense to use together: Flow is ideally
suited for "productionizing" insights first learned in the analytics
warehouse.


Spark / Flink
-------------

Spark and Flink are generalized execution engines for batch and
stream data processing. They're well known -- particularly Spark --
and both are actually available "runners" within Apache Beam.
Spark could be described as a batch engine with stream processing
add-ons, where Flink as a stream processing engine with batch
add-ons.

Flow best inter-operates with Spark through its "lake" capability.
Spark can view Flow collections as Hive-partitioned tables,
or just directly process bucket files.

For stream-stream joins, both Spark and Flink roughly share the execution
model and constraints of Apache Beam. In particular, they impose complex
"window-ization" requirements that also preclude their ability to offer
continuous materializations of generalized stream-to-stream joins
(eg, current lifetime value of a customer).


Kafka / Pulsar
--------------

Flow is built on Gazette, which is most similar to log-oriented pub/sub
systems like Kafka or Pulsar. Flow also uses Gazette's consumer framework,
which has similarities with Kafka Streams. Both manage scale-out execution
contexts for consumer tasks, offer durable local task stores, and provide
exactly-once semantics (though there are key differences).

*Unlike* those systems, Flow + Gazette use regular files with no special
formatting (eg, compressed JSON) as the primary data representation,
which powers its capabilities for integrating with other analytic tools.
During replays historical data is read directly from cloud storage,
which is strictly faster and more scalable, and reduces load on brokers.

Gazette's implementation of durable task stores also enables Flow's
novel, zero-downtime task splitting technique.
