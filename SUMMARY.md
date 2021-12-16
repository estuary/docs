# Table of contents

* [Flow documentation](README.md)

## Overview

* [Who should use Flow?](overview/who-should-use-flow.md)
* [Comparisons](overview/comparisons.md)

## Getting Started

* [Setting up a development environment](getting-started/installation.md)
* [Flow tutorials](getting-started/flow-tutorials/README.md)
  * [Hello Flow](getting-started/flow-tutorials/hello-world.md)
  * [Transformation basics: reductions and lambdas](getting-started/flow-tutorials/reducing-data-volumes-laking-and-materializing-it-to-databases.md)
  * [Stateful transformations and testing](getting-started/flow-tutorials/your-first-derivation.md)
  * [Working with remote URLs](getting-started/flow-tutorials/working-with-remote-urls.md)

## Concepts

* [High-level concepts](concepts/high-level-concepts.md)
* [Catalogs](concepts/catalog-entities/README.md)
  * [Catalog specification](concepts/catalog-entities/catalog-spec.md)
  * [Collections](concepts/catalog-entities/collections.md)
  * [Storage mappings](concepts/catalog-entities/storage-mappings.md)
  * [Schemas](concepts/catalog-entities/schemas-and-data-reductions.md)
  * [Reductions](concepts/catalog-entities/reductions.md)
  * [Captures](concepts/catalog-entities/captures.md)
  * [Materializations](concepts/catalog-entities/materialization.md)
  * [Derivations](concepts/catalog-entities/derivations/README.md)
    * [Derivation sources](concepts/catalog-entities/derivations/derivation-sources.md)
    * [Lambdas](concepts/catalog-entities/derivations/lambdas.md)
    * [Registers and shuffles](concepts/catalog-entities/derivations/registers-and-shuffles.md)
    * [Transformations](concepts/catalog-entities/derivations/transforms.md)
    * [Other derivation concepts](concepts/catalog-entities/derivations/other-derivation-concepts.md)
  * [Projections and partitions](concepts/catalog-entities/other-entities.md)
  * [Tests](concepts/catalog-entities/tests.md)

***

* [Connectors](connectors.md)
* [flowctl](flowctl.md)
* [Architecture](architecture/README.md)
  * [Collection storage](architecture/concepts-1.md)
  * [Task processing](architecture/scaling.md)

## Reference

* [Flow reference](reference/flow-reference.md)
* [Catalog design and specification](reference/catalog-reference/README.md)
  * [Collections](reference/catalog-reference/collections.md)
  * [Schemas](reference/catalog-reference/schemas-and-data-reductions.md)
  * [Captures](reference/catalog-reference/captures/README.md)
    * [Endpoint configurations](reference/catalog-reference/captures/endpoint-configurations.md)
  * [Materializations](reference/catalog-reference/materialization/README.md)
    * [Endpoint configurations](reference/catalog-reference/materialization/endpoints.md)
  * [Derivations](reference/catalog-reference/derivations/README.md)
    * [Lambdas](reference/catalog-reference/derivations/lambdas.md)
    * [Derivation patterns](reference/catalog-reference/derivations/derivation-patterns.md)
  * [Tests](reference/catalog-reference/tests.md)
* [Other data ingestion methods](reference/pushing-data-into-flow/README.md)
  * [Flow Ingester](reference/pushing-data-into-flow/flow-ingester.md)
  * [REST API](reference/pushing-data-into-flow/rest-api.md)
  * [WebSocket API](reference/pushing-data-into-flow/websocket-api.md)
* [Reduction strategies](reference/reduction-strategies/README.md)
  * [append](reference/reduction-strategies/append.md)
  * [firstWriteWins and lastWriteWins](reference/reduction-strategies/firstwritewins-and-lastwritewins.md)
  * [merge](reference/reduction-strategies/merge.md)
  * [minimize and maximize](reference/reduction-strategies/minimize-and-maximize.md)
  * [set](reference/reduction-strategies/set.md)
  * [sum](reference/reduction-strategies/sum.md)
  * [Composing with conditionals](reference/reduction-strategies/composing-with-conditionals.md)
* [flowctl outputs](reference/flowctl-build-outputs.md)
