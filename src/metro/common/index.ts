import { byProps } from "@metro/filters";
import { lookup } from "@metro/new/api";
import { lazyDestructure } from "@utils/lazy";

export * from "./components";

// Discord
export let constants = lookup(byProps(["Fonts", "Permissions"])).asLazy(m => (constants = m));
export let channels = lookup(byProps(["getVoiceChannelId"])).asLazy(m => (channels = m));
export let i18n = lookup(byProps(["Messages"])).asLazy(m => (i18n = m));
export let url = lookup(byProps(["openURL", "openDeeplink"])).asLazy(m => (url = m));
export let invites = lookup(byProps(["acceptInviteAndTransitionToInviteChannel"])).asLazy(m => (invites = m));
export let commands = lookup(byProps(["getBuiltInCommands"])).asLazy(m => (commands = m));
export let navigation = lookup(byProps(["pushLazy"])).asLazy(m => (navigation = m));
export let toasts = lookup(byProps(["createToast"])).asLazy(m => (toasts = m));
export let messageUtil = lookup(byProps(["sendBotMessage"])).asLazy(m => (messageUtil = m));
export let navigationStack = lookup(byProps(["createStackNavigator"])).asLazy(m => (navigationStack = m));
export let NavigationNative = lookup(byProps(["NavigationContainer"])).asLazy(m => (NavigationNative = m));
export let semver = lookup(byProps(["parse", "clean"])).asLazy(m => (semver = m));
export let chroma = lookup(byProps(["brewer"])).asLazy(m => (chroma = m)) as any;

export let tokens = lookup(byProps(["unsafe_rawColors", "colors"])).asLazy(m => (tokens = m));
export let { useToken } = lazyDestructure(() => lookup(byProps(["useToken"])).asLazy(m => ({ useToken } = m))) as any;

// Flux
export let Flux = lookup(byProps(["connectStores"])).asLazy(m => (Flux = m));
export let FluxDispatcher = lookup(byProps(["_interceptors"])).asLazy(m => (FluxDispatcher = m));
export let FluxUtils = lookup(byProps(["useStateFromStores"])).asLazy(m => (FluxUtils = m));

// React
export let React = lookup(byProps(["createElement"])).asLazy(m => (React = m));

// React Native
export let ReactNative = lookup(byProps(["AppRegistry"])).asLazy(m => (ReactNative = m));
export let assetsRegistry = lookup(byProps(["getAssetByID"])).asLazy(m => (assetsRegistry = m));

// export const i18n = findByProps("Messages");
// export const url = findByProps("openURL", "openDeeplink");
// export const assets = findByProps("registerAsset");
// export const invites = findByProps("acceptInviteAndTransitionToInviteChannel");
// export const commands = findByProps("getBuiltInCommands");
// export const navigation = findByProps("pushLazy");
// export const toasts = findByFilePath("modules/toast/native/ToastActionCreators.tsx", true);
// export const messageUtil = findByProps("sendBotMessage");
// export const navigationStack = findByProps("createStackNavigator");
// export const NavigationNative = findByProps("NavigationContainer");
// export const semver = findByProps("parse", "clean");

// export const tokens = findByProps("unsafe_rawColors", "colors");
// export const { useToken } = lazyDestructure(() => findByProps("useToken"));

// // Flux
// export const Flux = findByProps("connectStores");
// export const FluxDispatcher = findByProps("_interceptors");
// export const FluxUtils = findByProps("useStateFromStores");

// // React
// export const React = findByProps("createElement") as typeof import("react");

// // React Native
// export const ReactNative = findByProps("AppRegistry") as typeof import("react-native");
// export const assetsRegistry = findByProps("getAssetByID");
