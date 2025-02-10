import { lookupByProps } from "@metro/common/wrappers";

export * from "./Discord";
export * from "./Flux";

// 3rd Party Libraries
export let semver = lookupByProps("parse", "clean").asLazy(m => (semver = m));
export let chroma = lookupByProps("brewer").asLazy(m => (chroma = m)) as any;

// biome-ignore format: formatter adds trailing comma after the "react-native-reanimated" and TS doesn't like it
export let Reanimated = lookupByProps("useAnimatedStyle", "withSpring").asLazy(m => (Reanimated = m)) as typeof import("react-native-reanimated");
export let NavigationNative = lookupByProps("NavigationContainer").asLazy(m => (NavigationNative = m));

// React/React Native
export let React = lookupByProps("createElement").asLazy(m => (React = m));
export let ReactNative = lookupByProps("AppRegistry").asLazy(m => (ReactNative = m));
export let AssetsRegistry = lookupByProps("getAssetByID").asLazy(m => (AssetsRegistry = m));
