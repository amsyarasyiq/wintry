import { lookupByProps } from "@metro/common/wrappers";

export let Flux = lookupByProps("connectStores").asLazy(m => (Flux = m));
export let FluxDispatcher = lookupByProps("_interceptors").asLazy(m => (FluxDispatcher = m));
export let FluxUtils = lookupByProps("useStateFromStores").asLazy(m => (FluxUtils = m));
