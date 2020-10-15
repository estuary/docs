Citi Bike System Data
=====================

For this set of examples, we'll be using Flow to capture and process
Citi Bike `system data`_. The dataset is available in the S3 tripdata_
bucket, as compressed CSV files of each ride taken within the system,
by month.

.. _system data: https://www.citibikenyc.com/system-data
.. _tripdata: https://s3.amazonaws.com/tripdata/index.html

Modeling Rides
--------------

Every Flow collection has an associated `JSON Schema`_, which defines the
structure and semantics of its documents. Let's begin with a schema for
modeling Citi Bike rides:

.. _`JSON Schema`: http://json-schema.org/understanding-json-schema/index.html

.. literalinclude:: ride.schema.yaml
   :language: yaml

This schema is doing quite a bit of heavy lifting. Let's unpack a bit:

We're defining the *shape* that documents can take.
   A *ride* document must have a ``{"bike_id": ..., "begin": ..., "end": ...}``.
   A *location* must have a ``{"latitude": ..., "longitude": ...}``.
   We're able to use the ``$ref`` keyword to define and re-use common structures:
   e.g., a *terminus* can represent either the beginning or end of the trip.

*Validations* further constrain the types and values that documents can take.
   A ``longitude`` must be a number and fall within the expected range, and ``gender``
   must be a value within the expected enumeration.

*Annotations* attach information to location within the document.
   In this case, "title" and "description" give color to portions of the document,
   in a machine-accessible way -- which makes it possible to use and re-use these
   annotations in transformed versions of the schema.
   Annotations are perhaps `JSON Schema`_'s most powerful and
   important feature.

.. note::

   A core design goal of Flow is that it asks users to provide a rich modeling
   of their data only once, as a JSON schema. Thereafter, Flow *leverages*
   that definition to provide automatic transformations into other
   types of schemas -- SQL dialects, TypeScript types, and more.

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

   Flow offers a variety of ingestion APIs, including gRPC, WebSockets,
   and HTTP POST.


Deriving Current Bike Status
----------------------------

Materializing into PostgreSQL
-----------------------------

Foo

Bar
---

Baz

Bing
----

Moar