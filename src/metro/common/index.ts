import { lazyDestructure } from "@utils/lazy";
import { lookupByProps } from "@metro/new/common/wrappers";
export * from "./components";

// Discord
export let constants = lookupByProps("Fonts", "Permissions").asLazy(m => (constants = m));
export let i18n = lookupByProps("Messages").asLazy(m => (i18n = m));
export let tokens = lookupByProps("unsafe_rawColors", "colors").asLazy(m => (tokens = m));
export let { useToken } = lazyDestructure(() => lookupByProps("useToken").asLazy(m => ({ useToken } = m))) as any;

// Libraries
export let NavigationNative = lookupByProps("NavigationContainer").asLazy(m => (NavigationNative = m));
export let semver = lookupByProps("parse", "clean").asLazy(m => (semver = m));
export let chroma = lookupByProps("brewer").asLazy(m => (chroma = m)) as any;

// Flux
export let Flux = lookupByProps("connectStores").asLazy(m => (Flux = m));
export let FluxDispatcher = lookupByProps("_interceptors").asLazy(m => (FluxDispatcher = m));
export let FluxUtils = lookupByProps("useStateFromStores").asLazy(m => (FluxUtils = m));

// React
export let React = lookupByProps("createElement").asLazy(m => (React = m));

// React Native
export let ReactNative = lookupByProps("AppRegistry").asLazy(m => (ReactNative = m));
export let AssetsRegistry = lookupByProps("getAssetByID").asLazy(m => (AssetsRegistry = m));
