Wikipedia Edits
===============

We'll use to model Wikipedia page edits data, inspired by the `Druid documentation`_.

.. _`Druid documentation`: https://druid.apache.org/docs//0.15.1-incubating/tutorials/tutorial-batch.html

Captured Edits
--------------

Here's a collection spec which models a schema and captured collection for page edit data.

.. literalinclude:: edits.flow.yaml
   :language: yaml

We'll use Flow's ingestion API to capture the collection.
In a production setting, you could imagine the collection instead
being bound to a pub/sub topic or S3 bucket & path:

.. code-block:: console

   # Pull down dataset.
   $ wget https://github.com/apache/druid/raw/master/examples/quickstart/tutorial/wikiticker-2015-09-12-sampled.json.gz

   # Streaming ingest.
   $ gzip -cd wikiticker-2015-09-12-sampled.json.gz \
      | pv --line-mode --quiet --rate-limit 500 \
      | websocat --protocol json/v1 ws://localhost:8081/ingest/examples/wiki/edits

Page Roll-up
------------

We can roll-up page edits to understand edit statistics for each page,
including a by-country break down where the country is known:

.. literalinclude:: pages.flow.yaml
   :language: yaml

Materialize pages to a test database:

.. code-block:: console

    $ flowctl materialize --collection examples/wiki/pages --table-name pages --target testDB

Query for popular pages. This updates as edits are captured (repeat the ingest if it's too fast):

.. code-block:: SQL

   SELECT page, cnt, add, del, "byCountry" FROM pages WHERE cnt > 10;
