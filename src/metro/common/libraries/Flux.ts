import { lookupByProps } from "@metro/common/wrappers";
import type { FluxDispatcher as _FD } from "discord-types/other";

export let Flux = lookupByProps("connectStores").asLazy(m => (Flux = m));
export let FluxDispatcher = lookupByProps("_interceptors").asLazy(m => (FluxDispatcher = m)) as unknown as _FD;
export let FluxUtils = lookupByProps("useStateFromStores").asLazy(m => (FluxUtils = m));
