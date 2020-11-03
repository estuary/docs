Estuary Flow (Preview)
======================

Estuary Flow unifies technologies and teams around a shared understanding of
an organization's data, that updates continuously as new data records come in.
Flow works with the places where you produce or consume data today -- analytics
warehouses, OLTP databases, key/value stores, streaming systems, or SaaS APIs --
keeping them all in sync using incremental, event-driven map/reduce and
materializations.

With Flow, you can *capture* events from e.x. Kenesis or WebSockets; *organize*
them into an S3 "data lake" that integrates with tools like Spark or Snowflake;
*transform* by mapping individual events into a stitched profile, and *materialize*
aggregated profiles into a Redis store that reflects updates within milliseconds.
All in about 50 lines of YAML, and with rigorous data validations at every step.

Later, you can define derivations and materializations that will automatically
back-fill over months or even years of historical data, and which then seamlessly
transition to low latency updates of new data.

Flow is configuration driven and uses a developer-centric workflow that emphasizes
version control, composition and re-use, rich schematization, and built in testing.
It's runtime offers flexible scaling, and takes best advantage of data reductions
and cloud pricing models to offer a surprisingly low total cost of ownership.

This documentation lives at https://github.com/estuary/docs,
and is browse-able at https://estuary.readthedocs.io.

.. warning::

   Flow is currently in release preview. It's ready for local development and
   prototyping, but there are sharp edges, open issues, and missing features.

Running Examples
================

This documentation is interactive! You can directly open it on GitHub using
Codespaces_, or you can clone this repo and open using the `VSCode Remote Containers`_
extension. Both options will spin up an environment with the Flow CLI tools,
add-ons for VSCode editor support, and an attached PostgreSQL database for
trying out materializations. See :doc:`getting started vscode <docs/getting-started-vscode>` 
for a step-by-step walkthrough.

.. _Codespaces: https://github.com/features/codespaces
.. _`VSCode Remote Containers`: https://code.visualstudio.com/docs/remote/containers

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

   Concepts <concepts>
   Getting Started with VS Code <docs/getting-started-vscode>
   Reductions <reductions/README>
   Example: Citi Bike <citi-bike/README>
