Citi Bike System Data
=====================

We'll be using Flow to capture and process Citi Bike `system data`_.
The dataset is available in the S3 "tripdata_" bucket as compressed CSV files
of each ride taken within the system, by month.

.. _system data: https://www.citibikenyc.com/system-data
.. _tripdata: https://s3.amazonaws.com/tripdata/index.html

Modeling Rides
--------------

Every Flow collection has an associated `JSON Schema`_ which describes its
documents. Let's begin with a schema for modeling Citi Bike rides:

.. _`JSON Schema`: http://json-schema.org/understanding-json-schema/index.html

.. literalinclude:: ride.schema.yaml
   :language: yaml

There is a lot going on here. Let's unpack:

It defines the *shape* that documents can take.
   A *ride* document must have a ``{"bike_id": ..., "begin": ..., "end": ...}``.
   A *location* must have a ``{"latitude": ..., "longitude": ...}``, and so on.
   The ``$ref`` keyword makes it easy to define and re-use common structures;
   e.g., a "terminus" can represent either the beginning or end of the trip.

*Validations* constrain the types and values that documents can take.
   A "longitude" must be a number and fall within the expected range, and "gender"
   must be a value within the expected enumeration. Some properties are ``required``,
   while others are optional.

   Flow enforces that all documents of a collection must validate against its schema
   before they may be added, so that *readers* of a collection don't have to. Flow is
   also able to *translate* many schema constraints ("/begin/station/id must
   exist and be an integer") into other kinds of schema -- like TypeScript types --
   which promotes rigorous type-safety without having to re-check constraints already
   imposed by the schema.

*Annotations* attach information to locations within the document.
   Here, "title" and "description" give color to elements of the document.
   They're machine-accessible documentation -- which makes it possible to re-use
   these annotations in transformed versions of the schema.

   Annotations are perhaps `JSON Schema`_'s most powerful and important feature.
   Flow extends the JSON Schema specification with additional annotation keywords
   such as *reduction strategies*, which detail how multiple document instances
   can be combined together.

.. note::

   A core design goal of Flow is that users need only provide a modeling of
   their data *one time*, as a JSON schema. Thereafter, Flow analyzes that
   schema to provide automatic transformations into other schema flavors,
   like SQL dialects, TypeScript types, and more.

Capturing Rides
---------------

To work with ride events, first we need to define a collection into which we'll
ingest them. Simple enough, but a wrinkle is that the source dataset is
CSV files, using header names which don't match our schema:

.. code-block:: console

   $ wget https://s3.amazonaws.com/tripdata/JC-202009-citibike-tripdata.csv.zip
   $ unzip -p JC-202009-citibike-tripdata.csv.zip | head -3
   "tripduration","starttime","stoptime","start station id","start station name","start station latitude","start station longitude","end station id","end station name","end station latitude","end station longitude","bikeid","usertype","birth year","gender"
   222,"2020-09-01 00:15:58.6470","2020-09-01 00:19:40.8750",3186,"Grove St PATH",40.71958611647166,-74.04311746358871,3276,"Marin Light Rail",40.71458403535893,-74.04281705617905,45656,"Subscriber",1992,1
   193,"2020-09-01 00:49:00.7370","2020-09-01 00:52:14.3640",3640,"Journal Square",40.73367,-74.0625,3206,"Hilltop",40.7311689,-74.0575736,45352,"Subscriber",1991,1

*Projections* let us account for this, by defining a mapping between structured
document locations (as `JSON Pointers`_) and corresponding names ("fields")
in a flattened, table-based representation such as a CSV file or SQL table.

.. _`JSON Pointers`: https://docs.opis.io/json-schema/1.x/pointers.html

.. literalinclude:: rides.flow.yaml
   :language: yaml

Having done this, Flow's ingestion API will automatically identify the projection
of each CSV column from its header, and apply them to map each CSV row into a
document:

.. code-block:: console

   # Start a local instance of Flow.
   $ flowctl develop

   # Pipe CSV rows into Flow's CSV WebSocket ingestion API:
   $ unzip -p JC-202009-citibike-tripdata.csv.zip | websocat --protocol csv/v1 ws://localhost:8081/ingest/examples/citi-bike/rides
   {"Offsets":{"examples/citi-bike/rides/pivot=00":1416},"Processed":3}
   {"Offsets":{"examples/citi-bike/rides/pivot=00":473577},"Processed":1033}
   {"Offsets":{"examples/citi-bike/rides/pivot=00":775687},"Processed":1692}

.. note::

   Flow offers a variety of ingestion APIs: gRPC, WebSockets,
   and POSTs of JSON over HTTP. More are planned, such as Database, Kenesis,
   and Kafka integrations.

Deriving Current Bike Status
----------------------------

We'll declare and test a collection that derives, for each bike, the station it last arrived at:

.. literalinclude:: bike-locations.flow.yaml
   :language: yaml

We can materialize the collection into a database:

.. code-block:: console

   $ flowctl materialize --collection examples/citi-bike/bike-locations --all-fields --table-name bike_locations --target testDB

   $ psql postgres://flow:flow@localhost:5432 -c 'select bike_id, "seen/station/name", "seen/timestamp" from bike_locations limit 5;'


Materializing into PostgreSQL
-----------------------------

Foo

Bar
---

Baz

Bing
----

Moar