import * as anchors from './anchors';

// "Use" imported modules, even if they're empty, to satisfy compiler and linting.
export type __module = null;
export type __anchors_module = anchors.__module;

// Generated from examples/citi-bike/idle-bikes.flow.yaml?ptr=/collections/examples~1citi-bike~1idle-bikes/derivation/register/schema.
// Referenced as register_schema of examples/citi-bike/idle-bikes.flow.yaml#/collections/examples~1citi-bike~1idle-bikes/derivation.
export type ExamplesCitiBikeIdleBikes = string | null;

// Generated from examples/citi-bike/last-seen.flow.yaml?ptr=/collections/examples~1citi-bike~1last-seen/derivation/register/schema.
// Referenced as register_schema of examples/citi-bike/last-seen.flow.yaml#/collections/examples~1citi-bike~1last-seen/derivation.
export type ExamplesCitiBikeLastSeen = unknown;

// Generated from examples/citi-bike/ride.schema.yaml#/$defs/terminus.
// Referenced as register_schema of examples/citi-bike/rides-and-relocations.flow.yaml#/collections/examples~1citi-bike~1rides-and-relocations/derivation.
export type ExamplesCitiBikeRidesAndRelocations = /* Station and time at which a trip began or ended */ {
    station: /* A Citi Bike Station */ {
        geo?: /* Location of this station */ /* Geographic Location as Latitude & Longitude */ {
            latitude: number;
            longitude: number;
        };
        id: /* Unique identifier for this station */ number;
        name: /* Human-friendly name of this station */ string;
    };
    timestamp: /* Timestamp as YYYY-MM-DD HH:MM:SS.F in UTC */ string;
};

// Generated from examples/citi-bike/stations.flow.yaml?ptr=/collections/examples~1citi-bike~1stations/derivation/register/schema.
// Referenced as register_schema of examples/citi-bike/stations.flow.yaml#/collections/examples~1citi-bike~1stations/derivation.
export type ExamplesCitiBikeStations = unknown;

// Generated from examples/net-trace/services.flow.yaml?ptr=/collections/examples~1net-trace~1services/derivation/register/schema.
// Referenced as register_schema of examples/net-trace/services.flow.yaml#/collections/examples~1net-trace~1services/derivation.
export type ExamplesNetTraceServices = unknown;

// Generated from examples/re-key/schema.yaml#/$defs/join_register.
// Referenced as register_schema of examples/re-key/flow.yaml#/collections/examples~1re-key~1stable_events/derivation.
export type ExamplesReKeyStableEvents = /* Register that's keyed on anonymous ID, which:
  1) Stores anonymous events prior to a stable ID being known, and thereafter
  2) Stores a mapped stable ID for this anonymous ID.
 */ {
    events: /* An interesting event, keyed on an anonymous ID */ {
        anonymous_id: string;
        event_id: string;
    }[] | null;
    stable_id?: string;
};

// Generated from examples/shopping/cart-updates-with-products.flow.yaml?ptr=/collections/examples~1shopping~1cartUpdatesWithProducts/derivation/register/schema.
// Referenced as register_schema of examples/shopping/cart-updates-with-products.flow.yaml#/collections/examples~1shopping~1cartUpdatesWithProducts/derivation.
export type ExamplesShoppingCartUpdatesWithProducts = {
    id: number;
    name: string;
    price: number;
} | null;

// Generated from examples/shopping/carts.flow.yaml?ptr=/collections/examples~1shopping~1carts/derivation/register/schema.
// Referenced as register_schema of examples/shopping/carts.flow.yaml#/collections/examples~1shopping~1carts/derivation.
export type ExamplesShoppingCarts = {
    cartItems: {
        [k: string]: /* Represents a (possibly 0) quantity of a product within the cart */ {
            product?: /* A product that is available for purchase */ {
                id: number;
                name: string;
                price: number;
            };
            quantity?: number;
        }[];
    };
    userId: number;
};

// Generated from examples/shopping/cart.schema.yaml.
// Referenced as register_schema of examples/shopping/purchases.flow.yaml#/collections/examples~1shopping~1purchases/derivation.
export type ExamplesShoppingPurchases = /* Roll up of all products that users have added to a pending purchase */ {
    items: /* Represents a (possibly 0) quantity of a product within the cart */ {
        product?: /* A product that is available for purchase */ {
            id: number;
            name: string;
            price: number;
        };
        quantity?: number;
    }[];
    userId: number;
};

// Generated from examples/wiki/pages.flow.yaml?ptr=/collections/examples~1wiki~1pages/derivation/register/schema.
// Referenced as register_schema of examples/wiki/pages.flow.yaml#/collections/examples~1wiki~1pages/derivation.
export type ExamplesWikiPages = unknown;

// Generated from derive-patterns/schema.yaml#Join.
// Referenced as register_schema of derive-patterns/join-inner.flow.yaml#/collections/patterns~1inner-join/derivation.
export type PatternsInnerJoin = anchors.Join;

// Generated from derive-patterns/schema.yaml#Join.
// Referenced as register_schema of derive-patterns/join-one-sided.flow.yaml#/collections/patterns~1one-sided-join/derivation.
export type PatternsOneSidedJoin = anchors.Join;

// Generated from derive-patterns/join-outer.flow.yaml?ptr=/collections/patterns~1outer-join/derivation/register/schema.
// Referenced as register_schema of derive-patterns/join-outer.flow.yaml#/collections/patterns~1outer-join/derivation.
export type PatternsOuterJoin = unknown;

// Generated from derive-patterns/summer.flow.yaml?ptr=/collections/patterns~1sums-db/derivation/register/schema.
// Referenced as register_schema of derive-patterns/summer.flow.yaml#/collections/patterns~1sums-db/derivation.
export type PatternsSumsDb = unknown;

// Generated from derive-patterns/summer.flow.yaml?ptr=/collections/patterns~1sums-register/derivation/register/schema.
// Referenced as register_schema of derive-patterns/summer.flow.yaml#/collections/patterns~1sums-register/derivation.
export type PatternsSumsRegister = number;

// Generated from derive-patterns/zero-crossing.flow.yaml?ptr=/collections/patterns~1zero-crossing/derivation/register/schema.
// Referenced as register_schema of derive-patterns/zero-crossing.flow.yaml#/collections/patterns~1zero-crossing/derivation.
export type PatternsZeroCrossing = number;
