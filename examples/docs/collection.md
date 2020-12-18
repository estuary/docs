---

This is intended to be an example of how we would like to display documentation using Estuary.  The "Collection" section is the page a user would see after clicking a collection.

---



[**Collections**](/workspace/examples/docs/collections.md) | [**Endpoints**](/workspace/examples/docs/Endpoints.md)

<br></br>

# Collection 3

</br>

| Description | Date Added | Size | Key |
| ----------- | --------- |---| --- |
| Information about Collection 3 | 12/20/2020 |25kb | [/foo,/bar] |

<br>


![image](/workspace/examples/docs/images/fullGraph.png)



[All](filter) | [All Ancestors](filter) | [All Descendants](filter) | [1 Level](filter) | [2 Levels](filter)

</br>

## Schema


| Name | Key | Type | Description | Constraints | Metadata |
| ------ | ----------- | --------- |---| --- | --- |
| Field 1   | Yes | Integer | Field 1 is an integer | N/A | N/A |
| Field 2   | Yes | String | Field 2 is a string | N/A | N/A |
| Field 3   | Yes | Integer | Field 3 is an integer | > 0 | N/A |

---

</br>

## Source Collections


* [Collection 2](link)</br>
* [Collection 3](link)</br>
   * [Closer collections would be linked and indented](link) 
</br>

</br>

---
## Sink Collections


 * N/A, but would be same format as Source Collections

</br>

---

 ## Transforms

 * Transform 1
 * Transform 2
     * These can optionally link to a page containing the transforms raw YAML.

</br>

---
 ## Register Schema

| Name | Key | Type | Description | Constraints | Metadata |
| ------ | ----------- | --------- |---| --- | --- |
| Field 1   | Yes | Integer | Field 1 is an integer | N/A | N/A |
| Field 2   | Yes | String | Field 2 is a string | N/A | N/A |
| Field 3   | Yes | Integer | Field 3 is an integer | > 0 | N/A |