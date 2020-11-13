
Ingesting Data
==============

There are a number of different options for how to ingest data into Flow:

* `HTTP PUT or POST requests`
* `Stream data over a Websocket` in either `CSV, TSV`, or `JSON` formats


flow-ingester
-------------

Flow ships with the ``flow-ingester`` binary, which provides network service endpoints for ingesting
data into Flow Collections. There are currently two main APIs, a REST API accepts data in HTTP PUT and
POST requests, and a websocket API that accepts data streamed over websocket connections. Only
captured collections may ingest data in this way, not derivations.

When you run ``flowctl develop``, the Flow Ingester will listen on ``http://localhost:8081`` by default.

Flow Ingester will always validate all documents against the collection's schema before they are written,
so invalid data will never be added to the collection. Note that your collection schema may
be as permissive as you like, and you can always apply more restrictive schemas in derivations if
you want to.

Flow Ingester will also reduce all documents according to the collection key and reduction
annotations on the schema, if present. This is done to optimize the storage space for collections
that see frequent updates to the same key.

REST API
--------

The REST API makes it easy to add data to one or more Flow collections transactionally. The endpoint
is available at ``/ingest`` (e.g. ``http://localhost:8081/ingest``). This endpoint will respond only
to PUT and POST requests with a ``Content-Type: application/json``. Any other method or content type
will result in a 404 error response. The request body should be a JSON object where the keys are
names of Flow Collections, and the values are arrays of documents for that collection. For example,

.. code-block:: console

    curl -H 'Content-Type: application/json' --data @- 'http://localhost:8081/ingest' <<EOF
    {
        "examples/citi-bike/rides": [
            {
                "bike_id": 7,
                "begin": {
                    "timestamp": "2020-08-27 09:30:01.2",
                    "station": {
                        "id": 3,
                        "name": "Start Name"
                    }
                },
                "end": {
                    "timestamp": "2020-08-27 10:00:02.3",
                    "station": {
                        "id": 4,
                        "name": "End Name"
                    }
                }
            }
        ]
    }
    EOF

Running the above should result in output similar to the following:

.. code-block:: console

    {"Offsets":{"examples/citi-bike/rides/pivot=00":305},"Etcd":{"cluster_id":14841639068965178418,"member_id":10276657743932975437,"revision":28,"raft_term":2}}

In this example, we are ingesting a single document (beginning with ``{ "bike_id": 7,...``)
into the collection ``examples/citi-bike/rides``. You may ingest any number of documents into any
number of Flow Collections in a single request body, and they will be added in a single transaction.
The response ``Offsets`` includes all of the Gazette journals where the data was written, along with
the new "head" of the Journal. This is provided only to allow for applications to read data directly
from Gazette or cloud storage if desired.


REST Transactional Semantics
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Flow Ingester will ingest the data using a single Gazette transaction per REST request. For details
on Gazette transactions, see the `Gazette Transactional Append docs`_. The summary is basically that:

* If the HTTP response indicates success, then the documents are guaranteed to be written to the gazette brokers and replicated.
* If the HTTP response indicates an error, then the transaction will not be committed and no derivations will observe any of the documents.

.. _`Gazette Transactional Append docs`: https://gazette.readthedocs.io/en/latest/architecture-transactional-appends.html


Websocket API
-------------

The Websocket API provides an alternative for ingesting data, which is especially useful when you
don't know how much data there is ahead of time, or when you don't need precise control over
transaction boundaries. When ingesting over a websocket, the ingester will automatically divide the
data into periodic transactions to provide optimal performance. The websocket API is also more
flexible in the data formats that it can accept, so it's able to ingest CSV/TSV data directly, in
addition to JSON. The websocket API is only able to ingest into a single collection per websocket
connection, though.

The collection for websocket ingestions is given in the path of the URL, as in:
``/ingest/<collection-name>``. For example, to ingest into the ``examples/citi-bike/rides``
collection, you'd use ``ws://localhost:8081/ingest/examples/citi-bike/rides``.

For all websocket ingestions, the `Sec-Websocket-Protocol`_ header must be set when initiating the
websocket connection. The value must be one of:

* ``json/v1``
* ``csv/v1``
* ``tsv/v1``

If you're using the `websocat CLI`_, then you can simply use the ``--protocol`` option.

.. _`Sec-Websocket-Protocol`: https://tools.ietf.org/html/rfc6455
.. _`websocat CLI`: https://github.com/vi/websocat

Ingesting JSON over Websocket
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When ingesting JSON, Flow Ingester accepts data over the websocket in "JSON-newline" (a.k.a. `JSON Lines`_) format.
Objects should not be enclosed within an array or have any separator characters between them except for whitespace.
For example, to ingest a few rides into the ``examples/citi-bike/rides`` collection, lets start with
the documents in JSON Lines format in the file ``rides.jsonl``:

.. code-block:: json

    {"bike_id":7,"begin":{"timestamp":"2020-08-27 09:30:01","station":{"id":66,"name":"North 4th St"}},"end":{"timestamp":"2020-08-27 10:00:02","station":{"id":23,"name":"High St"}}}
    {"bike_id":26,"begin":{"timestamp":"2020-08-27 09:32:01","station":{"id":91,"name":"Grant Ave"}},"end":{"timestamp":"2020-08-27 09:50:12","station":{"id":23,"name":"High St"}}}

Given the above content in a file named ``rides.jsonl``, we could ingest it using ``websocat`` like
so:

.. code-block:: console

    cat rides.jsonl | websocat --protocol json/v1 'ws://localhost:8081/ingest/examples/citi-bike/rides'

This will add the data to the collection named ``examples/citi-bike/rides``.

Ingesting CSV/TSV over Websocket
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Flow Ingester is able to ingest a few different character-separated formats. Currently it supports
Comma-separated (CSV) and Tab-separated (TSV) formats, using the `csv/v1` and `tsv/v1` protocols,
respectively. Flow collections always store all data in JSON documents that validate against the
collection's schema, so the tabular data in character-separated files must be converted to JSON
before being written. Flow Ingester will convert these for you, based on the headers in the data and
the projections for the Flow Collection. Each header in a character-separated ingestion must have
the same name as a :ref:`projection <concepts-projections>` of the Collection. The projection will
be used to map the field named by the header to the JSON pointer, which is used to construct the
JSON document. For example, the ``examples/citi-bike/rides`` collection looks like this:

.. literalinclude:: citi-bike/rides.flow.yaml
    :language: yaml
    :lines: 1-27
    :emphasize-lines: 13-27

Given this, we could ingest a CSV file that looks like:

.. code-block:: csv

    bikeid,starttime,"start station id","start station name",stoptime,"end station id","end station name"
    7,"2020-08-27 09:30:01",66,"North 4th St","2020-08-27 10:00:02",23,"High St"
    26,"2020-08-27 09:32:01",91,"Grant Ave","2020-08-27 09:50:12",23,"High St"

Assuming this was the content of ``rides.csv``, you could ingest it using:

.. code-block::

    cat rides.csv | websocat --protocol csv/v1 'ws://localhost:8081/ingest/examples/citi-bike/rides'

The actual JSON documents that would be written to the collection are:

.. code-block:: json

    {"bike_id":7,"begin":{"timestamp":"2020-08-27 09:30:01","station":{"id":66,"name":"North 4th St"}},"end":{"timestamp":"2020-08-27 10:00:02","station":{"id":23,"name":"High St"}}}
    {"bike_id":26,"begin":{"timestamp":"2020-08-27 09:32:01","station":{"id":91,"name":"Grant Ave"}},"end":{"timestamp":"2020-08-27 09:50:12","station":{"id":23,"name":"High St"}}}

For example, the projection ``bikeid: /bike_id`` means that, for each row in the CSV, the value of
the "bikeid" column was used to populate the ``bike_id`` property of the final document. Flow uses
the collection's json schema to determine the required type of each property. Additionally, each
document that's constructed is validated against the collection's schema prior to it being written.

Null, Empty, and Missing Values
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In JSON documents, there's a difference between an explicit ``null`` value and one that's undefined.
When Flow Ingester parses a character-separated row, it also differntiates between ``null``, empty
string, and undefined values. Empty values being ingested are always interpreted as explicit
``null`` values as long as the schema location allows for ``null`` values (e.g. ``type: ["integer",
"null"]``). If the schema does not allow ``null`` as an acceptable type, but it does allow
``string``, then the value will be interpreted as an empty string. A row may also have fewer values
than exist in the header row. If it does, than any unspecified column values will be undefined in
the final document. In the following example, let's assume that the schema allows for the types in
each column's name.

.. code-block:: csv

    id,string,stringOrNull,integerOrNull
    1,"","",""
    2,,,
    3,
    4

Assuming simple direct projections, this would result in the following JSON documents being ingested:

.. code-block:: json
    :linenos:

    {"id": 1, "string": "", "stringOrNull": null, "integerOrNull": null}
    {"id": 2, "string": "", "stringOrNull": null, "integerOrNull": null}
    {"id": 3, "string": ""}
    {"id": 4}

Note how in rows ``1`` and ``2``, empty ``stringOrNull`` values are mapped to ``null``, regardless of the presence of
quotes. In row ``3``, the trailing comma indicates that the row has two values, and that the second value is empty (``""``), but the remainder are undefined. In row ``4``, all values besides ``id`` are undefined.


Websocket Responses
~~~~~~~~~~~~~~~~~~~

Regardless of which format you ingest, all websocket ingestions will return responses similar to
the following:

.. code-block:: console

    {"Offsets":{"examples/citi-bike/rides/pivot=00":545},"Etcd":{"cluster_id":14841639068965178418,"member_id":10276657743932975437,"revision":28,"raft_term":2},"Processed":2}

The response will show the offsets of the transaction boundaries in the Gazette
journals. If you ingest larger amounts of data, you will receive many such responses. In addition to the
journal offsets, each response also includes the ``Processed`` property, which indicates the number
of websocket frames that have been successfully ingested. This can be used to allow clients to
resume where they left off in the case that a websocket ingestion fails partway through. For
example, if you sent one json object per websocket frame, then you would know from the ``Processed``
field how many documents had been successfully ingested prior to the failure (``Processed`` times
the number of documents per frame).

.. _`JSON Lines`: https://jsonlines.org/
