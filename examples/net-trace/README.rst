Network Traces
==============

We'll tackle a few network monitoring tasks, using data drawn from this
`Kaggle Dataset`_ of collected network traces.

.. _`Kaggle Dataset`: https://www.kaggle.com/jsrojas/ip-network-traffic-flows-labeled-with-87-apps

.. caution:: This example is a work in progress, and currently more of a sketch. Contributions welcome!

Trace Dataset
-------------

Our source dataset_ contains network traces of source & destination endpoints,
packet flows, and bytes -- much like what you'd obtain from tcpdump.
It has many repetitions, including records having the same pair of endpoints and timestamp.

.. _dataset: https://storage.googleapis.com/estuaryflowexamples/network-flows.csv.gz

.. code-block:: csv

   Source.IP,Source.Port,Destination.IP,Destination.Port,Protocol,Timestamp,Flow.Duration,Total.Fwd.Packets,Total.Backward.Packets,Total.Length.of.Fwd.Packets,Total.Length.of.Bwd.Packets
   172.19.1.46,52422,10.200.7.7,3128,6,26/04/201711:11:17,45523,22,55,132,110414
   10.200.7.7,3128,172.19.1.46,52422,6,26/04/201711:11:17,1,2,0,12,0
   50.31.185.39,80,10.200.7.217,38848,6,26/04/201711:11:17,1,3,0,674,0
   50.31.185.39,80,10.200.7.217,38848,6,26/04/201711:11:17,217,1,3,0,0
   192.168.72.43,55961,10.200.7.7,3128,6,26/04/201711:11:17,78068,5,0,1076,0
   10.200.7.6,3128,172.19.1.56,50004,6,26/04/201711:11:17,105069,136,0,313554,0
   192.168.72.43,55963,10.200.7.7,3128,6,26/04/201711:11:17,104443,5,0,1076,0
   192.168.10.47,51848,10.200.7.6,3128,6,26/04/201711:11:17,11002,3,12,232,3664


Capturing Peer-to-Peer Flows
----------------------------

We don't necessarily want to model the level of granularity that's present in the
source dataset, within a collection. Cloud storage is cheap, sure, but we simply
just don't need or want multiple records per second, per address pair. That's still
data we have to examine every time we process the collection.

Instead we can key on address pairs, and lean on reduction annotations to aggregate
any repeat records that may occur within a single ingestion transaction.
Here's a schema:

.. literalinclude:: schema.yaml
   :language: yaml

And a captured collection into which we'll ingest:

.. literalinclude:: pairs.flow.yaml
   :language: yaml

Kick off streamed capture:

.. code-block:: console

   # Start a local development instance, and leave it running:
   $ flowctl develop

   # In another terminal:
   $ examples/net-trace/load-traces.sh

Service Traffic by Day
----------------------

A simplistic view which identifies *services* (endpoints having a port under 1024),
and their aggregate network traffic by day:

.. literalinclude:: services.flow.yaml
   :language: yaml

Materialize to a test database:

.. code-block:: console

    $ flowctl materialize --collection examples/net-trace/services --table-name services --target testDB