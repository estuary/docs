# Demo script - the technical bits

### Here's a collection:

in `flow.yaml`:
```
collections:
  - name: utility/poles
    key: [/id]
    schema: schema.yaml#/$defs/pole
    projections:
      locationType: /location/type
      long: /location/coordinates/0
      lat: /location/coordinates/1
```

This collection represents a source of truth for poles, and you can wire in basically any
application or workflow to provide that actual data, either in realtime or as batch processes.

Build the catalog:
```
flowctl build --source utility/flow.yaml
flowctl develop &
```

### We can ingest some poles documents via HTTP

```
curl -H 'Content-Type: application/json' -d @- 'http://localhost:8081/ingest' <<EOF
{
  "utility/poles": [
    {
      "id": "a",
      "height": 55,
      "class": 2,
      "material": "SP",
      "setDate": "2020-06-16",
      "location": {
        "type": "Point",
        "coordinates": [39.9752, -83.0345]
      },
      "jointUsers": [ "AT&T" ]
    },
    {
      "id": "b",
      "height": 40,
      "class": 4,
      "material": "SP",
      "setDate": "2001-08-31",
      "location": {
        "type": "Point",
        "coordinates": [39.9764, -83.0342]
      }
    },
    {
      "id": "c",
      "jointUsers": [ "AT&T", "TimeWarner" ]
    }
  ]
}
EOF
```

Can also ingest CSV, which uses projections of the poles collection:
```
cat utility/poles.csv | websocat --protocol csv/v1 'ws://localhost:8081/ingest/utility/poles'
```

We can see the data as it's layed out in cloud storage (or local filesystem):

```
gazctl journals read -l name=utility/poles/pivot=00
```

We can also materialize a view of this collection to a database:

```
flowctl materialize --collection utility/poles --target testDB --table-name poles_test --all-fields
```

### Add more captured collections and a derivation

Inspections indicate that someone has looked at a pole, and may have decided that some service or repairs are required.

### Add some inspections

```
cat utility/inspections.csv | websocat --protocol csv/v1 'ws://localhost:8081/ingest/utility/inspections'
```

### Observe the results of the derivation:

Materialize a view of the derived collection, which will be kept up to date in real time.

```
flowctl materialize --collection utility/poles-requiring-maintenance --target testDB --table-name naughty_poles_test --all-fields
```

Take a look at the results in posgres:

```
psql 'postgresql://flow:flow@localhost:5432/flow?sslmode=disable'

select * from naughty_poles_test;
```

### Complete a repair

Send an HTTP request that indicates that a pole repair has been completed
```
curl -H 'Content-Type: application/json' -d '{"utility/completed-repairs": [{ "poleId": "a", "inspectorId": "Frank", "repairDate": "2020-04-05"}]}' 'http://localhost:8081/ingest'
```

### Observe the results in postgres again

```
psql 'postgresql://flow:flow@localhost:5432/flow?sslmode=disable'

select * from naughty_poles_test;
```

Now our `serviceRequired` column shows `null` for pole a.
