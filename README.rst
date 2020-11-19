Estuary Flow (Preview)
======================

Estuary Flow unifies technologies and teams around a shared understanding of
an organization's data, that updates continuously as new data records come in.

Flow is primarily targeted to backend engineers who must manage various
continuous data sources, with multiple use cases and stakeholders.
It makes it easy for engineers to turn sources -- e.g. streaming pub/sub
topics or file drops -- into pristine S3 "data lakes" that are documented and
discoverable to analysts, ML engineers, and others using their preferred
tooling (e.g. via direct Snowflake / Spark integration).

Engineers can then go on to define *operational transforms* that draw from the
same data -- with its complete understanding of history -- to build new data
products that continuously materialize into databases, pub/sub, and SaaS.
All with end-to-end latency in the milliseconds.

Flow's continuous transform capability is **uniquely powerful**.
Build complex joins and aggregations that have unlimited historical look-back,
with no onerous windowing requirements, and which are simple to define and evolve.
Once declared, Flow back-fills transformations directly from the S3 lake
and then seamlessly transitions to live updates.
New data products -- or fixes to existing ones -- are assured of consistent results, every time.
The Flow runtime manages scaling and recovers from faults in seconds, for true "hands-free" operation.

Flow is configuration driven and uses a developer-centric workflow that emphasizes
version control, composition & re-use, rigorous schematization, and built in testing.
It's runtime takes best advantage of data reductions
and cloud pricing models to offer a surprisingly low total cost of ownership.

This documentation lives at https://github.com/estuary/docs,
and is browse-able at https://estuary.readthedocs.io.

.. warning::

   Flow is currently in release preview. It's ready for local development and
   prototyping, but there are sharp edges, open issues, and missing features.

Running Examples
================

This documentation is interactive! You can directly open it on GitHub using
Codespaces_, or you can clone this repo and open using the VSCode Remote Containers
extension (see our guide_). Both options will spin up an environment with the Flow CLI tools,
add-ons for VSCode editor support, and an attached PostgreSQL database for
trying out materializations.

.. _Codespaces: https://github.com/features/codespaces
.. _`VSCode Remote Containers`: https://code.visualstudio.com/docs/remote/containers
.. _guide: docs/getting-started-vscode

.. code-block:: console

   # Build this documentation repository's Flow catalog.
   $ flowctl build

   # Run all catalog tests.
   $ flowctl test

Gazette
=======

Flow is built upon Gazette_. A basic understanding of Gazette concepts can be
helpful for understanding Flow's runtime and architecture, but isn't required
to work with Flow.

.. _Gazette: https://gazette.readthedocs.io/en/latest/

Table of Contents
=================

.. toctree::
   :maxdepth: 2
   :caption: Overview

   How Flow Helps <docs/how-flow-helps>
   Comparisons <docs/comparisons>
   Working with VS Code <docs/getting-started-vscode>
   Concepts <docs/concepts>
   Reduction Types <reductions/README>
   Derivation Patterns <derive-patterns/README>
   Ingesting Data <docs/ingest>
   Example: Citi Bike <examples/citi-bike/README>
   Example: Wiki Edits <examples/wiki/README>
   Example: Network Traces <examples/net-trace/README>
