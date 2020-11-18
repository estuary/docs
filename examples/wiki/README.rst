Wikipedia Edits
===============

We'll use to model Wikipedia page edits data, inspired by the `Druid documentation`_.

.. _`Druid documentation`: https://druid.apache.org/docs//0.15.1-incubating/tutorials/tutorial-batch.html

Captured Edits
--------------

Our source dataset has documents like:

.. code-block:: json

   {
   "time": "2015-09-12T22:02:05.807Z",
   "channel": "#en.wikipedia",
   "cityName": "New York",
   "comment": "/* Life and career */",
   "countryIsoCode": "US",
   "countryName": "United States",
   "isAnonymous": true,
   "isMinor": false,
   "isNew": false,
   "isRobot": false,
   "isUnpatrolled": false,
   "metroCode": 501,
   "namespace": "Main",
   "page": "Louis Gruenberg",
   "regionIsoCode": "NY",
   "regionName": "New York",
   "user": "68.175.31.28",
   "delta": 178,
   "added": 178,
   "deleted": 0
   }

Here's a captured collection for these page edits:

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

We can roll-up on page to understand edit statistics for each one,
including a by-country break down (where the country is known):

.. literalinclude:: pages.flow.yaml
   :language: yaml

Materialize pages to a test database:

.. code-block:: console

    $ flowctl materialize --collection examples/wiki/pages --table-name pages --target testDB

Query for popular pages. This updates as edits are captured (repeat the ingest if it's too fast):

.. code-block:: SQL

   SELECT page, cnt, add, del, "byCountry" FROM pages WHERE cnt > 10;
