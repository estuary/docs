import * as collections from './collections';
import * as registers from './registers';
import * as transforms from './transforms';

// "Use" imported modules, even if they're empty, to satisfy compiler and linting.
export type __module = null;
export type __collections_module = collections.__module;
export type __registers_module = registers.__module;
export type __transforms_module = transforms.__module;

// Generated from derivation examples/citi-bike/idle-bikes.flow.yaml#/collections/examples~1citi-bike~1idle-bikes/derivation.
// Required to be implemented by examples/citi-bike/idle-bikes.flow.ts.
export interface ExamplesCitiBikeIdleBikes {
    delayedRidesPublish(
        source: collections.ExamplesCitiBikeRides,
        register: registers.ExamplesCitiBikeIdleBikes,
        previous: registers.ExamplesCitiBikeIdleBikes,
    ): collections.ExamplesCitiBikeIdleBikes[];
    liveRidesUpdate(
        source: collections.ExamplesCitiBikeRides,
    ): registers.ExamplesCitiBikeIdleBikes[];
}

// Generated from derivation examples/citi-bike/last-seen.flow.yaml#/collections/examples~1citi-bike~1last-seen/derivation.
// Required to be implemented by examples/citi-bike/last-seen.flow.ts.
export interface ExamplesCitiBikeLastSeen {
    locationFromRidePublish(
        source: collections.ExamplesCitiBikeRides,
        register: registers.ExamplesCitiBikeLastSeen,
        previous: registers.ExamplesCitiBikeLastSeen,
    ): collections.ExamplesCitiBikeLastSeen[];
}

// Generated from derivation examples/citi-bike/rides-and-relocations.flow.yaml#/collections/examples~1citi-bike~1rides-and-relocations/derivation.
// Required to be implemented by examples/citi-bike/rides-and-relocations.flow.ts.
export interface ExamplesCitiBikeRidesAndRelocations {
    fromRidesUpdate(
        source: collections.ExamplesCitiBikeRides,
    ): registers.ExamplesCitiBikeRidesAndRelocations[];
    fromRidesPublish(
        source: collections.ExamplesCitiBikeRides,
        register: registers.ExamplesCitiBikeRidesAndRelocations,
        previous: registers.ExamplesCitiBikeRidesAndRelocations,
    ): collections.ExamplesCitiBikeRidesAndRelocations[];
}

// Generated from derivation examples/citi-bike/stations.flow.yaml#/collections/examples~1citi-bike~1stations/derivation.
// Required to be implemented by examples/citi-bike/stations.flow.ts.
export interface ExamplesCitiBikeStations {
    ridesAndMovesPublish(
        source: collections.ExamplesCitiBikeRidesAndRelocations,
        register: registers.ExamplesCitiBikeStations,
        previous: registers.ExamplesCitiBikeStations,
    ): collections.ExamplesCitiBikeStations[];
}

// Generated from derivation examples/net-trace/services.flow.yaml#/collections/examples~1net-trace~1services/derivation.
// Required to be implemented by examples/net-trace/services.flow.ts.
export interface ExamplesNetTraceServices {
    fromPairsPublish(
        source: collections.ExamplesNetTracePairs,
        register: registers.ExamplesNetTraceServices,
        previous: registers.ExamplesNetTraceServices,
    ): collections.ExamplesNetTraceServices[];
}

// Generated from derivation examples/re-key/flow.yaml#/collections/examples~1re-key~1stable_events/derivation.
// Required to be implemented by examples/re-key/flow.ts.
export interface ExamplesReKeyStableEvents {
    fromAnonymousEventsUpdate(
        source: collections.ExamplesReKeyAnonymousEvents,
    ): registers.ExamplesReKeyStableEvents[];
    fromAnonymousEventsPublish(
        source: collections.ExamplesReKeyAnonymousEvents,
        register: registers.ExamplesReKeyStableEvents,
        previous: registers.ExamplesReKeyStableEvents,
    ): collections.ExamplesReKeyStableEvents[];
    fromIdMappingsUpdate(
        source: collections.ExamplesReKeyMappings,
    ): registers.ExamplesReKeyStableEvents[];
    fromIdMappingsPublish(
        source: collections.ExamplesReKeyMappings,
        register: registers.ExamplesReKeyStableEvents,
        previous: registers.ExamplesReKeyStableEvents,
    ): collections.ExamplesReKeyStableEvents[];
}

// Generated from derivation examples/shopping/cart-updates-with-products.flow.yaml#/collections/examples~1shopping~1cartUpdatesWithProducts/derivation.
// Required to be implemented by examples/shopping/cart-updates-with-products.flow.ts.
export interface ExamplesShoppingCartUpdatesWithProducts {
    cartUpdatesPublish(
        source: collections.ExamplesShoppingCartUpdates,
        register: registers.ExamplesShoppingCartUpdatesWithProducts,
        previous: registers.ExamplesShoppingCartUpdatesWithProducts,
    ): collections.ExamplesShoppingCartUpdatesWithProducts[];
    productsUpdate(
        source: collections.ExamplesShoppingProducts,
    ): registers.ExamplesShoppingCartUpdatesWithProducts[];
}

// Generated from derivation examples/shopping/carts.flow.yaml#/collections/examples~1shopping~1carts/derivation.
// Required to be implemented by examples/shopping/carts.flow.ts.
export interface ExamplesShoppingCarts {
    cartUpdatesWithProductsUpdate(
        source: collections.ExamplesShoppingCartUpdatesWithProducts,
    ): registers.ExamplesShoppingCarts[];
    cartUpdatesWithProductsPublish(
        source: collections.ExamplesShoppingCartUpdatesWithProducts,
        register: registers.ExamplesShoppingCarts,
        previous: registers.ExamplesShoppingCarts,
    ): collections.ExamplesShoppingCarts[];
    clearAfterPurchaseUpdate(
        source: collections.ExamplesShoppingCartPurchaseRequests,
    ): registers.ExamplesShoppingCarts[];
    clearAfterPurchasePublish(
        source: collections.ExamplesShoppingCartPurchaseRequests,
        register: registers.ExamplesShoppingCarts,
        previous: registers.ExamplesShoppingCarts,
    ): collections.ExamplesShoppingCarts[];
}

// Generated from derivation examples/shopping/purchases.flow.yaml#/collections/examples~1shopping~1purchases/derivation.
// Required to be implemented by examples/shopping/purchases.flow.ts.
export interface ExamplesShoppingPurchases {
    cartsUpdate(
        source: collections.ExamplesShoppingCarts,
    ): registers.ExamplesShoppingPurchases[];
    purchaseActionsPublish(
        source: collections.ExamplesShoppingCartPurchaseRequests,
        register: registers.ExamplesShoppingPurchases,
        previous: registers.ExamplesShoppingPurchases,
    ): collections.ExamplesShoppingPurchases[];
}

// Generated from derivation examples/wiki/pages.flow.yaml#/collections/examples~1wiki~1pages/derivation.
// Required to be implemented by examples/wiki/pages.flow.ts.
export interface ExamplesWikiPages {
    rollUpEditsPublish(
        source: collections.ExamplesWikiEdits,
        register: registers.ExamplesWikiPages,
        previous: registers.ExamplesWikiPages,
    ): collections.ExamplesWikiPages[];
}

// Generated from derivation derive-patterns/join-inner.flow.yaml#/collections/patterns~1inner-join/derivation.
// Required to be implemented by derive-patterns/join-inner.flow.ts.
export interface PatternsInnerJoin {
    fromIntsUpdate(
        source: collections.PatternsInts,
    ): registers.PatternsInnerJoin[];
    fromIntsPublish(
        source: collections.PatternsInts,
        register: registers.PatternsInnerJoin,
        previous: registers.PatternsInnerJoin,
    ): collections.PatternsInnerJoin[];
    fromStringsUpdate(
        source: collections.PatternsStrings,
    ): registers.PatternsInnerJoin[];
    fromStringsPublish(
        source: collections.PatternsStrings,
        register: registers.PatternsInnerJoin,
        previous: registers.PatternsInnerJoin,
    ): collections.PatternsInnerJoin[];
}

// Generated from derivation derive-patterns/join-one-sided.flow.yaml#/collections/patterns~1one-sided-join/derivation.
// Required to be implemented by derive-patterns/join-one-sided.flow.ts.
export interface PatternsOneSidedJoin {
    publishLHSPublish(
        source: collections.PatternsInts,
        register: registers.PatternsOneSidedJoin,
        previous: registers.PatternsOneSidedJoin,
    ): collections.PatternsOneSidedJoin[];
    updateRHSUpdate(
        source: collections.PatternsStrings,
    ): registers.PatternsOneSidedJoin[];
}

// Generated from derivation derive-patterns/join-outer.flow.yaml#/collections/patterns~1outer-join/derivation.
// Required to be implemented by derive-patterns/join-outer.flow.ts.
export interface PatternsOuterJoin {
    fromIntsPublish(
        source: collections.PatternsInts,
        register: registers.PatternsOuterJoin,
        previous: registers.PatternsOuterJoin,
    ): collections.PatternsOuterJoin[];
    fromStringsPublish(
        source: collections.PatternsStrings,
        register: registers.PatternsOuterJoin,
        previous: registers.PatternsOuterJoin,
    ): collections.PatternsOuterJoin[];
}

// Generated from derivation derive-patterns/summer.flow.yaml#/collections/patterns~1sums-db/derivation.
// Required to be implemented by derive-patterns/summer.flow.ts.
export interface PatternsSumsDb {
    fromIntsPublish(
        source: collections.PatternsInts,
        register: registers.PatternsSumsDb,
        previous: registers.PatternsSumsDb,
    ): collections.PatternsSumsDb[];
}

// Generated from derivation derive-patterns/summer.flow.yaml#/collections/patterns~1sums-register/derivation.
// Required to be implemented by derive-patterns/summer.flow.ts.
export interface PatternsSumsRegister {
    fromIntsUpdate(
        source: collections.PatternsInts,
    ): registers.PatternsSumsRegister[];
    fromIntsPublish(
        source: collections.PatternsInts,
        register: registers.PatternsSumsRegister,
        previous: registers.PatternsSumsRegister,
    ): collections.PatternsSumsRegister[];
}

// Generated from derivation derive-patterns/zero-crossing.flow.yaml#/collections/patterns~1zero-crossing/derivation.
// Required to be implemented by derive-patterns/zero-crossing.flow.ts.
export interface PatternsZeroCrossing {
    fromIntsUpdate(
        source: collections.PatternsInts,
    ): registers.PatternsZeroCrossing[];
    fromIntsPublish(
        source: collections.PatternsInts,
        register: registers.PatternsZeroCrossing,
        previous: registers.PatternsZeroCrossing,
    ): collections.PatternsZeroCrossing[];
}
