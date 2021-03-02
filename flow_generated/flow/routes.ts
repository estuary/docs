import * as interfaces from './interfaces';

// Document is a relaxed signature for a Flow document of any kind.
export type Document = unknown;
// Lambda is a relaxed signature implemented by all Flow transformation lambdas.
export type Lambda = (source: Document, register?: Document, previous?: Document) => Document[];

// Import derivation classes from their implementation modules.
import {
    PatternsInnerJoin,
} from '../../derive-patterns/join-inner.flow';

import {
    PatternsOneSidedJoin,
} from '../../derive-patterns/join-one-sided.flow';

import {
    PatternsOuterJoin,
} from '../../derive-patterns/join-outer.flow';

import {
    PatternsSumsDb,
    PatternsSumsRegister,
} from '../../derive-patterns/summer.flow';

import {
    PatternsZeroCrossing,
} from '../../derive-patterns/zero-crossing.flow';

import {
    ExamplesCitiBikeIdleBikes,
} from '../../examples/citi-bike/idle-bikes.flow';

import {
    ExamplesCitiBikeLastSeen,
} from '../../examples/citi-bike/last-seen.flow';

import {
    ExamplesCitiBikeRidesAndRelocations,
} from '../../examples/citi-bike/rides-and-relocations.flow';

import {
    ExamplesCitiBikeStations,
} from '../../examples/citi-bike/stations.flow';

import {
    ExamplesNetTraceServices,
} from '../../examples/net-trace/services.flow';

import {
    ExamplesReKeyStableEvents,
} from '../../examples/re-key/flow';

import {
    ExamplesShoppingCartUpdatesWithProducts,
} from '../../examples/shopping/cart-updates-with-products.flow';

import {
    ExamplesShoppingCarts,
} from '../../examples/shopping/carts.flow';

import {
    ExamplesShoppingPurchases,
} from '../../examples/shopping/purchases.flow';

import {
    ExamplesWikiPages,
} from '../../examples/wiki/pages.flow';

// Build instances of each class, which will be bound to this module's router.
let __ExamplesCitiBikeIdleBikes: interfaces.ExamplesCitiBikeIdleBikes = new ExamplesCitiBikeIdleBikes();
let __ExamplesCitiBikeLastSeen: interfaces.ExamplesCitiBikeLastSeen = new ExamplesCitiBikeLastSeen();
let __ExamplesCitiBikeRidesAndRelocations: interfaces.ExamplesCitiBikeRidesAndRelocations = new ExamplesCitiBikeRidesAndRelocations();
let __ExamplesCitiBikeStations: interfaces.ExamplesCitiBikeStations = new ExamplesCitiBikeStations();
let __ExamplesNetTraceServices: interfaces.ExamplesNetTraceServices = new ExamplesNetTraceServices();
let __ExamplesReKeyStableEvents: interfaces.ExamplesReKeyStableEvents = new ExamplesReKeyStableEvents();
let __ExamplesShoppingCartUpdatesWithProducts: interfaces.ExamplesShoppingCartUpdatesWithProducts = new ExamplesShoppingCartUpdatesWithProducts();
let __ExamplesShoppingCarts: interfaces.ExamplesShoppingCarts = new ExamplesShoppingCarts();
let __ExamplesShoppingPurchases: interfaces.ExamplesShoppingPurchases = new ExamplesShoppingPurchases();
let __ExamplesWikiPages: interfaces.ExamplesWikiPages = new ExamplesWikiPages();
let __PatternsInnerJoin: interfaces.PatternsInnerJoin = new PatternsInnerJoin();
let __PatternsOneSidedJoin: interfaces.PatternsOneSidedJoin = new PatternsOneSidedJoin();
let __PatternsOuterJoin: interfaces.PatternsOuterJoin = new PatternsOuterJoin();
let __PatternsSumsDb: interfaces.PatternsSumsDb = new PatternsSumsDb();
let __PatternsSumsRegister: interfaces.PatternsSumsRegister = new PatternsSumsRegister();
let __PatternsZeroCrossing: interfaces.PatternsZeroCrossing = new PatternsZeroCrossing();

// Now build the router that's used for transformation lambda dispatch.
let routes: { [path: string]: Lambda | undefined } = {
    '/derive/examples/citi-bike/idle-bikes/delayedRides/Publish': __ExamplesCitiBikeIdleBikes.delayedRidesPublish.bind(
        __ExamplesCitiBikeIdleBikes,
    ) as Lambda,
    '/derive/examples/citi-bike/idle-bikes/liveRides/Update': __ExamplesCitiBikeIdleBikes.liveRidesUpdate.bind(
        __ExamplesCitiBikeIdleBikes,
    ) as Lambda,
    '/derive/examples/citi-bike/last-seen/locationFromRide/Publish': __ExamplesCitiBikeLastSeen.locationFromRidePublish.bind(
        __ExamplesCitiBikeLastSeen,
    ) as Lambda,
    '/derive/examples/citi-bike/rides-and-relocations/fromRides/Update': __ExamplesCitiBikeRidesAndRelocations.fromRidesUpdate.bind(
        __ExamplesCitiBikeRidesAndRelocations,
    ) as Lambda,
    '/derive/examples/citi-bike/rides-and-relocations/fromRides/Publish': __ExamplesCitiBikeRidesAndRelocations.fromRidesPublish.bind(
        __ExamplesCitiBikeRidesAndRelocations,
    ) as Lambda,
    '/derive/examples/citi-bike/stations/ridesAndMoves/Publish': __ExamplesCitiBikeStations.ridesAndMovesPublish.bind(
        __ExamplesCitiBikeStations,
    ) as Lambda,
    '/derive/examples/net-trace/services/fromPairs/Publish': __ExamplesNetTraceServices.fromPairsPublish.bind(
        __ExamplesNetTraceServices,
    ) as Lambda,
    '/derive/examples/re-key/stable_events/fromAnonymousEvents/Update': __ExamplesReKeyStableEvents.fromAnonymousEventsUpdate.bind(
        __ExamplesReKeyStableEvents,
    ) as Lambda,
    '/derive/examples/re-key/stable_events/fromAnonymousEvents/Publish': __ExamplesReKeyStableEvents.fromAnonymousEventsPublish.bind(
        __ExamplesReKeyStableEvents,
    ) as Lambda,
    '/derive/examples/re-key/stable_events/fromIdMappings/Update': __ExamplesReKeyStableEvents.fromIdMappingsUpdate.bind(
        __ExamplesReKeyStableEvents,
    ) as Lambda,
    '/derive/examples/re-key/stable_events/fromIdMappings/Publish': __ExamplesReKeyStableEvents.fromIdMappingsPublish.bind(
        __ExamplesReKeyStableEvents,
    ) as Lambda,
    '/derive/examples/shopping/cartUpdatesWithProducts/cartUpdates/Publish': __ExamplesShoppingCartUpdatesWithProducts.cartUpdatesPublish.bind(
        __ExamplesShoppingCartUpdatesWithProducts,
    ) as Lambda,
    '/derive/examples/shopping/cartUpdatesWithProducts/products/Update': __ExamplesShoppingCartUpdatesWithProducts.productsUpdate.bind(
        __ExamplesShoppingCartUpdatesWithProducts,
    ) as Lambda,
    '/derive/examples/shopping/carts/cartUpdatesWithProducts/Update': __ExamplesShoppingCarts.cartUpdatesWithProductsUpdate.bind(
        __ExamplesShoppingCarts,
    ) as Lambda,
    '/derive/examples/shopping/carts/cartUpdatesWithProducts/Publish': __ExamplesShoppingCarts.cartUpdatesWithProductsPublish.bind(
        __ExamplesShoppingCarts,
    ) as Lambda,
    '/derive/examples/shopping/carts/clearAfterPurchase/Update': __ExamplesShoppingCarts.clearAfterPurchaseUpdate.bind(
        __ExamplesShoppingCarts,
    ) as Lambda,
    '/derive/examples/shopping/carts/clearAfterPurchase/Publish': __ExamplesShoppingCarts.clearAfterPurchasePublish.bind(
        __ExamplesShoppingCarts,
    ) as Lambda,
    '/derive/examples/shopping/purchases/carts/Update': __ExamplesShoppingPurchases.cartsUpdate.bind(
        __ExamplesShoppingPurchases,
    ) as Lambda,
    '/derive/examples/shopping/purchases/purchaseActions/Publish': __ExamplesShoppingPurchases.purchaseActionsPublish.bind(
        __ExamplesShoppingPurchases,
    ) as Lambda,
    '/derive/examples/wiki/pages/rollUpEdits/Publish': __ExamplesWikiPages.rollUpEditsPublish.bind(
        __ExamplesWikiPages,
    ) as Lambda,
    '/derive/patterns/inner-join/fromInts/Update': __PatternsInnerJoin.fromIntsUpdate.bind(
        __PatternsInnerJoin,
    ) as Lambda,
    '/derive/patterns/inner-join/fromInts/Publish': __PatternsInnerJoin.fromIntsPublish.bind(
        __PatternsInnerJoin,
    ) as Lambda,
    '/derive/patterns/inner-join/fromStrings/Update': __PatternsInnerJoin.fromStringsUpdate.bind(
        __PatternsInnerJoin,
    ) as Lambda,
    '/derive/patterns/inner-join/fromStrings/Publish': __PatternsInnerJoin.fromStringsPublish.bind(
        __PatternsInnerJoin,
    ) as Lambda,
    '/derive/patterns/one-sided-join/publishLHS/Publish': __PatternsOneSidedJoin.publishLHSPublish.bind(
        __PatternsOneSidedJoin,
    ) as Lambda,
    '/derive/patterns/one-sided-join/updateRHS/Update': __PatternsOneSidedJoin.updateRHSUpdate.bind(
        __PatternsOneSidedJoin,
    ) as Lambda,
    '/derive/patterns/outer-join/fromInts/Publish': __PatternsOuterJoin.fromIntsPublish.bind(
        __PatternsOuterJoin,
    ) as Lambda,
    '/derive/patterns/outer-join/fromStrings/Publish': __PatternsOuterJoin.fromStringsPublish.bind(
        __PatternsOuterJoin,
    ) as Lambda,
    '/derive/patterns/sums-db/fromInts/Publish': __PatternsSumsDb.fromIntsPublish.bind(
        __PatternsSumsDb,
    ) as Lambda,
    '/derive/patterns/sums-register/fromInts/Update': __PatternsSumsRegister.fromIntsUpdate.bind(
        __PatternsSumsRegister,
    ) as Lambda,
    '/derive/patterns/sums-register/fromInts/Publish': __PatternsSumsRegister.fromIntsPublish.bind(
        __PatternsSumsRegister,
    ) as Lambda,
    '/derive/patterns/zero-crossing/fromInts/Update': __PatternsZeroCrossing.fromIntsUpdate.bind(
        __PatternsZeroCrossing,
    ) as Lambda,
    '/derive/patterns/zero-crossing/fromInts/Publish': __PatternsZeroCrossing.fromIntsPublish.bind(
        __PatternsZeroCrossing,
    ) as Lambda,
};

export { routes };
