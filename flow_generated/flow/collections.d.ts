import * as anchors from './anchors';

// "Use" imported modules, even if they're empty, to satisfy compiler and linting.
export type __module = null;
export type __anchors_module = anchors.__module;

// Generated from reductions/append.flow.yaml?ptr=/collections/example~1reductions~1append/schema.
// Referenced as schema of reductions/append.flow.yaml#/collections/example~1reductions~1append.
export type ExampleReductionsAppend = {
    key: string;
    value?: unknown[];
};

// Generated from reductions/fww_lww.flow.yaml?ptr=/collections/example~1reductions~1fww-lww/schema.
// Referenced as schema of reductions/fww_lww.flow.yaml#/collections/example~1reductions~1fww-lww.
export type ExampleReductionsFwwLww = {
    fww?: unknown;
    key: string;
    lww?: unknown;
};

// Generated from reductions/merge.flow.yaml?ptr=/collections/example~1reductions~1merge/schema.
// Referenced as schema of reductions/merge.flow.yaml#/collections/example~1reductions~1merge.
export type ExampleReductionsMerge = {
    key: string;
    value?: {
        [k: string]: number;
    } | number[];
};

// Generated from reductions/merge_key.flow.yaml?ptr=/collections/example~1reductions~1merge-key/schema.
// Referenced as schema of reductions/merge_key.flow.yaml#/collections/example~1reductions~1merge-key.
export type ExampleReductionsMergeKey = {
    key: string;
    value?: unknown[];
};

// Generated from reductions/min_max.flow.yaml?ptr=/collections/example~1reductions~1min-max/schema.
// Referenced as schema of reductions/min_max.flow.yaml#/collections/example~1reductions~1min-max.
export type ExampleReductionsMinMax = {
    key: string;
    max?: unknown;
    min?: unknown;
};

// Generated from reductions/min_max_key.flow.yaml?ptr=/collections/example~1reductions~1min-max-key/schema.
// Referenced as schema of reductions/min_max_key.flow.yaml#/collections/example~1reductions~1min-max-key.
export type ExampleReductionsMinMaxKey = {
    key: string;
    max?: [string?, number?];
    min?: [string?, number?];
};

// Generated from reductions/set.flow.yaml?ptr=/collections/example~1reductions~1set/schema.
// Referenced as schema of reductions/set.flow.yaml#/collections/example~1reductions~1set.
export type ExampleReductionsSet = {
    key: string;
    value?: {
        [k: string]: {
            [k: string]: number;
        };
    };
};

// Generated from reductions/set_array.flow.yaml?ptr=/collections/example~1reductions~1set-array/schema.
// Referenced as schema of reductions/set_array.flow.yaml#/collections/example~1reductions~1set-array.
export type ExampleReductionsSetArray = {
    key: string;
    value?: {
        [k: string]: [string?, number?][];
    };
};

// Generated from reductions/sum.flow.yaml?ptr=/collections/example~1reductions~1sum/schema.
// Referenced as schema of reductions/sum.flow.yaml#/collections/example~1reductions~1sum.
export type ExampleReductionsSum = {
    key: string;
    value?: number;
};

// Generated from reductions/reset_counter.flow.yaml?ptr=/collections/example~1reductions~1sum-reset/schema.
// Referenced as schema of reductions/reset_counter.flow.yaml#/collections/example~1reductions~1sum-reset.
export type ExampleReductionsSumReset = {
    action?: "reset" | "sum";
    key: string;
    value?: number;
};

// Generated from examples/citi-bike/idle-bikes.flow.yaml?ptr=/collections/examples~1citi-bike~1idle-bikes/schema.
// Referenced as schema of examples/citi-bike/idle-bikes.flow.yaml#/collections/examples~1citi-bike~1idle-bikes.
export type ExamplesCitiBikeIdleBikes = {
    bike_id: number;
    station: /* Station and time at which a trip began or ended */ {
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
};

// Generated from examples/citi-bike/last-seen.flow.yaml?ptr=/collections/examples~1citi-bike~1last-seen/schema.
// Referenced as schema of examples/citi-bike/last-seen.flow.yaml#/collections/examples~1citi-bike~1last-seen.
export type ExamplesCitiBikeLastSeen = {
    bike_id: /* Unique identifier for this bike */ number;
    last: /* Station and time at which a trip began or ended */ {
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
};

// Generated from https://raw.githubusercontent.com/estuary/docs/developer-docs/examples/citi-bike/ride.schema.yaml.
// Referenced as schema of examples/citi-bike/rides.flow.yaml#/collections/examples~1citi-bike~1rides.
export type ExamplesCitiBikeRides = /* Ride within the Citi Bike system */ {
    begin: /* Starting point of the trip */ /* Station and time at which a trip began or ended */ {
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
    bike_id: /* Unique identifier for this bike */ number;
    birth_year?: /* Birth year of the rider */ number;
    duration_seconds?: /* Duration of the trip, in seconds */ number;
    end: /* Ending point of the trip */ /* Station and time at which a trip began or ended */ {
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
    gender?: /* Gender of the rider (Zero=unknown; 1=male; 2=female) */ 0 | 1 | 2;
    user_type?: /* Subscriber, or pay-as-you-go Customer */ "Customer" | "Subscriber";
};

// Generated from examples/citi-bike/rides-and-relocations.flow.yaml?ptr=/collections/examples~1citi-bike~1rides-and-relocations/schema.
// Referenced as schema of examples/citi-bike/rides-and-relocations.flow.yaml#/collections/examples~1citi-bike~1rides-and-relocations.
export type ExamplesCitiBikeRidesAndRelocations = /* Ride within the Citi Bike system */ {
    begin: /* Starting point of the trip */ /* Station and time at which a trip began or ended */ {
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
    bike_id: /* Unique identifier for this bike */ number;
    birth_year?: /* Birth year of the rider */ number;
    duration_seconds?: /* Duration of the trip, in seconds */ number;
    end: /* Ending point of the trip */ /* Station and time at which a trip began or ended */ {
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
    gender?: /* Gender of the rider (Zero=unknown; 1=male; 2=female) */ 0 | 1 | 2;
    relocation?: true;
    user_type?: /* Subscriber, or pay-as-you-go Customer */ "Customer" | "Subscriber";
};

// Generated from examples/citi-bike/station.schema.yaml.
// Referenced as schema of examples/citi-bike/stations.flow.yaml#/collections/examples~1citi-bike~1stations.
export type ExamplesCitiBikeStations = /* A Citi Bike Station */ {
    arrival?: /* Statistics on Bike arrivals to the station */ {
        move?: /* Bikes moved to the station */ number;
        ride?: /* Bikes ridden to the station */ number;
    };
    departure?: /* Statistics on Bike departures from the station */ {
        move?: /* Bikes moved from the station */ number;
        ride?: /* Bikes ridden from the station */ number;
    };
    geo?: /* Location of this station */ /* Geographic Location as Latitude & Longitude */ {
        latitude: number;
        longitude: number;
    };
    id: /* Unique identifier for this station */ number;
    name: /* Human-friendly name of this station */ string;
    stable?: /* Set of Bike IDs which are currently at this station */ {
        [k: string]: number[];
    };
};

// Generated from examples/net-trace/pairs.flow.yaml?ptr=/collections/examples~1net-trace~1pairs/schema.
// Referenced as schema of examples/net-trace/pairs.flow.yaml#/collections/examples~1net-trace~1pairs.
export type ExamplesNetTracePairs = {
    bwd?: {
        bytes?: number;
        packets?: number;
    };
    dst: {
        ip: string;
        port: number;
    };
    fwd?: {
        bytes?: number;
        packets?: number;
    };
    millis?: number;
    protocol: 0 | 6 | 17;
    src: {
        ip: string;
        port: number;
    };
    timestamp: string;
};

// Generated from examples/net-trace/services.flow.yaml?ptr=/collections/examples~1net-trace~1services/schema.
// Referenced as schema of examples/net-trace/services.flow.yaml#/collections/examples~1net-trace~1services.
export type ExamplesNetTraceServices = {
    date: string;
    service: {
        ip: string;
        port: number;
    };
    stats?: {
        bytes?: number;
        packets?: number;
    };
};

// Generated from examples/re-key/schema.yaml#/$defs/anonymous_event.
// Referenced as schema of examples/re-key/flow.yaml#/collections/examples~1re-key~1anonymous_events.
export type ExamplesReKeyAnonymousEvents = /* An interesting event, keyed on an anonymous ID */ {
    anonymous_id: string;
    event_id: string;
};

// Generated from examples/re-key/schema.yaml#/$defs/id_mapping.
// Referenced as schema of examples/re-key/flow.yaml#/collections/examples~1re-key~1mappings.
export type ExamplesReKeyMappings = /* A learned association of an anonymous ID <=> stable ID */ {
    anonymous_id: string;
    stable_id: string;
};

// Generated from examples/re-key/schema.yaml#/$defs/stable_event.
// Referenced as schema of examples/re-key/flow.yaml#/collections/examples~1re-key~1stable_events.
export type ExamplesReKeyStableEvents = /* An event enriched with a stable ID */ {
    anonymous_id: string;
    event_id: string;
    stable_id: string;
};

// Generated from examples/shopping/cart-purchase-requests.flow.yaml?ptr=/collections/examples~1shopping~1cartPurchaseRequests/schema.
// Referenced as schema of examples/shopping/cart-purchase-requests.flow.yaml#/collections/examples~1shopping~1cartPurchaseRequests.
export type ExamplesShoppingCartPurchaseRequests = /* Represents a request from a user to purchase the items in their cart. */ {
    timestamp: string;
    userId: number;
};

// Generated from examples/shopping/cart-update.schema.yaml.
// Referenced as schema of examples/shopping/cart-updates.flow.yaml#/collections/examples~1shopping~1cartUpdates.
export type ExamplesShoppingCartUpdates = /* Represents a request from a user to add or remove a product in their cart. */ {
    productId: number;
    quantity: /* The amount to adjust, which can be negative to remove items. */ number;
    userId: number;
};

// Generated from examples/shopping/cart-updates-with-products.flow.yaml?ptr=/collections/examples~1shopping~1cartUpdatesWithProducts/schema.
// Referenced as schema of examples/shopping/cart-updates-with-products.flow.yaml#/collections/examples~1shopping~1cartUpdatesWithProducts.
export type ExamplesShoppingCartUpdatesWithProducts = {
    action: /* Represents a request from a user to add or remove a product in their cart. */ {
        productId: number;
        quantity: /* The amount to adjust, which can be negative to remove items. */ number;
        userId: number;
    };
    product: /* A product that is available for purchase */ {
        id: number;
        name: string;
        price: number;
    };
};

// Generated from examples/shopping/cart.schema.yaml.
// Referenced as schema of examples/shopping/carts.flow.yaml#/collections/examples~1shopping~1carts.
export type ExamplesShoppingCarts = /* Roll up of all products that users have added to a pending purchase */ {
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

// Generated from examples/shopping/product.schema.yaml.
// Referenced as schema of examples/shopping/products.flow.yaml#/collections/examples~1shopping~1products.
export type ExamplesShoppingProducts = /* A product that is available for purchase */ {
    id: number;
    name: string;
    price: number;
};

// Generated from examples/shopping/purchase.schema.yaml.
// Referenced as schema of examples/shopping/purchases.flow.yaml#/collections/examples~1shopping~1purchases.
export type ExamplesShoppingPurchases = /* A confirmed order for items that were in the users cart */ {
    items: /* Represents a (possibly 0) quantity of a product within the cart */ {
        product?: /* A product that is available for purchase */ {
            id: number;
            name: string;
            price: number;
        };
        quantity?: number;
    }[];
    timestamp: string;
    userId: number;
};

// Generated from examples/shopping/user.schema.yaml.
// Referenced as schema of examples/shopping/users.flow.yaml#/collections/examples~1shopping~1users.
export type ExamplesShoppingUsers = /* A user who may buy things from our site */ {
    email: string;
    id: number;
    name: string;
};

// Generated from examples/wiki/edits.flow.yaml?ptr=/collections/examples~1wiki~1edits/schema.
// Referenced as schema of examples/wiki/edits.flow.yaml#/collections/examples~1wiki~1edits.
export type ExamplesWikiEdits = {
    added?: number;
    channel: string;
    countryIsoCode?: string | null;
    deleted?: number;
    page: string;
    time: string;
};

// Generated from examples/wiki/pages.flow.yaml?ptr=/collections/examples~1wiki~1pages/schema.
// Referenced as schema of examples/wiki/pages.flow.yaml#/collections/examples~1wiki~1pages.
export type ExamplesWikiPages = {
    add?: number;
    byCountry?: {
        [k: string]: {
            add?: number;
            cnt?: number;
            del?: number;
        };
    };
    cnt?: number;
    del?: number;
    page: string;
};

// Generated from derive-patterns/join-inner.flow.yaml?ptr=/collections/patterns~1inner-join/schema.
// Referenced as schema of derive-patterns/join-inner.flow.yaml#/collections/patterns~1inner-join.
export type PatternsInnerJoin = /* Document for join examples */ {
    Key: string;
    LHS?: number;
    RHS?: string[];
};

// Generated from derive-patterns/schema.yaml#Int.
// Referenced as schema of derive-patterns/inputs.flow.yaml#/collections/patterns~1ints.
export type PatternsInts = anchors.Int;

// Generated from derive-patterns/join-one-sided.flow.yaml?ptr=/collections/patterns~1one-sided-join/schema.
// Referenced as schema of derive-patterns/join-one-sided.flow.yaml#/collections/patterns~1one-sided-join.
export type PatternsOneSidedJoin = /* Document for join examples */ {
    Key: string;
    LHS?: number;
    RHS?: string[];
};

// Generated from derive-patterns/join-outer.flow.yaml?ptr=/collections/patterns~1outer-join/schema.
// Referenced as schema of derive-patterns/join-outer.flow.yaml#/collections/patterns~1outer-join.
export type PatternsOuterJoin = /* Document for join examples */ {
    Key: string;
    LHS?: number;
    RHS?: string[];
};

// Generated from derive-patterns/schema.yaml#String.
// Referenced as schema of derive-patterns/inputs.flow.yaml#/collections/patterns~1strings.
export type PatternsStrings = anchors.String;

// Generated from derive-patterns/summer.flow.yaml?ptr=/collections/patterns~1sums-db/schema.
// Referenced as schema of derive-patterns/summer.flow.yaml#/collections/patterns~1sums-db.
export type PatternsSumsDb = {
    Key: string;
    Sum?: number;
};

// Generated from derive-patterns/summer.flow.yaml?ptr=/collections/patterns~1sums-register/schema.
// Referenced as schema of derive-patterns/summer.flow.yaml#/collections/patterns~1sums-register.
export type PatternsSumsRegister = {
    Key: string;
    Sum?: number;
};

// Generated from derive-patterns/schema.yaml#Int.
// Referenced as schema of derive-patterns/zero-crossing.flow.yaml#/collections/patterns~1zero-crossing.
export type PatternsZeroCrossing = anchors.Int;
