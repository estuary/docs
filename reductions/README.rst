Reductions
==========

Flow implements a number of reduction strategies for use within schemas.
More are planned, including strategies for building data sketches (HyperLogLogs,
HyperMinHashes, T-Digests, etc), as well as extensions of existing strategies
to provide policies for bounding the sizes of objects and arrays, and specifying
fine-grained eviction policies.

For a given collection key, the Flow runtime guarantees a total ordering over
the documents of that key written to a given logical partition (but not *across*
logical partitions). It also guarantees exactly-once semantics within derived
collections, and even materializations (if the target system is transactional).

This means that strategies must be *associative* [e.g. (2+3) + 4 = 2 + (3+4) ],
but need not be commutative [ 2 + 3 = 3 + 2 ] or idempotent [ S u S = S ]. It expands
the palette of strategies which can be implemented, and allows for more efficient
implementations as compared to, e.g., CRDTs_.

In documentation, we'll refer to the "left-hand side" (LHS) as the preceding
document, and the "right-hand side" (RHS) as the following one. Keep in mind
that both the LHS and RHS may themselves represent a combination of still
more ordered documents (e.g, reductions are applied *associatively*).

.. _CRDTs: https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type

append
------

``append`` works with arrays, and extends the left-hand array with items of the right-hand side.

.. literalinclude:: append.flow.yaml
   :language: yaml

firstWriteWins / lastWriteWins
--------------------------------------

``firstWriteWins`` always takes the first value seen at the annotated location.
Likewise ``lastWriteWins`` always takes the last. Schemas which don't have
an explicit reduce annotation use last write wins behavior.

.. literalinclude:: fww_lww.flow.yaml
   :language: yaml

merge
-----

``merge`` reduces the LHS and RHS by recursively reducing shared document
locations. The LHS and RHS must either both be objects, or both be arrays.

If both sides are objects then it performs a deep merge of each property.
If LHS and RHS are both arrays then items at each index of both sides
are merged together, extending the shorter of the two sides by taking items
of the longer:

.. literalinclude:: merge.flow.yaml
   :language: yaml

Merge may also take a ``key``, which is one or more JSON pointers that are
relative to the reduced location. If both sides are arrays and a merge
key is present, then a deep sorted merge of the respective items is
done, as ordered by the key. Arrays must be pre-sorted and de-duplicated
by the key, and merge itself always maintains this invariant.

Note that a key of [""] can be used for natural item ordering, e.x. when
merging sorted arrays of scalars.

.. literalinclude:: merge_key.flow.yaml
   :language: yaml

minimize / maximize
-------------------

``minimize`` and ``maximize`` reduce by taking the smallest (or largest) seen value.

.. literalinclude:: min_max.flow.yaml
   :language: yaml

Minimize and maximize can also take a ``key``, which is one or more JSON pointers
that are relative to the reduced location. Keys make it possible to min/max over
more complex types, by ordering over an extracted composite key.

In the event that a RHS document key equals the current LHS minimum (or maximum),
then documents are deeply merged. This can be used to, for example, track not
just the minimum value but also the number of times it's been seen:

.. literalinclude:: min_max_key.flow.yaml
   :language: yaml

set
---

``set`` interprets the document location as an update to a set.

The location must be an object having (only) "add", "intersect",
and "remove" properties. Any single "add", "intersect", or "remove"
is always allowed.

A document with "intersect" and "add" is allowed, and is interpreted
as applying the intersection to the LHS set, followed by a union with
the additions.

A document with "remove" and "add" is also allowed, and is interpreted
as applying the removals to the base set, followed by a union with
the additions.

"remove" and "intersect" within the same instance is prohibited.

Set additions are deeply merged. This makes sets behave like associative
maps, where the "value" of a set member can be updated by adding it to
set again, with a reducible update.

Sets may be objects, in which case the object property serves as the
set item key:

.. literalinclude:: set.flow.yaml
   :language: yaml

Sets can also be sorted arrays, which are ordered using a provide ``key``
extractor. Keys are given as one or more JSON pointers, each relative to
the item.

Use a key extractor of [""] to apply the natural ordering of scalar values.

Whether arrays or objects are used, the selected type must always be
consistent across the "add" / "intersect" / "remove" terms of both
sides of the reduction.

.. literalinclude:: set_array.flow.yaml
   :language: yaml

sum
---

``sum`` reduces two numbers or integers by adding their values.

.. literalinclude:: sum.flow.yaml
   :language: yaml