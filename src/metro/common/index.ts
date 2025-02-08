import { lazyDestructure } from "@utils/lazy";
import { lookupByProps } from "@metro/new/common/wrappers";
export * from "./components";

// Discord
export let constants = lookupByProps("Fonts", "Permissions").asLazy(m => (constants = m));
export let channels = lookupByProps("getVoiceChannelId").asLazy(m => (channels = m));
export let i18n = lookupByProps("Messages").asLazy(m => (i18n = m));
export let url = lookupByProps("openURL", "openDeeplink").asLazy(m => (url = m));
export let invites = lookupByProps("acceptInviteAndTransitionToInviteChannel").asLazy(m => (invites = m));
export let commands = lookupByProps("getBuiltInCommands").asLazy(m => (commands = m));
export let navigation = lookupByProps("pushLazy").asLazy(m => (navigation = m));
export let toasts = lookupByProps("createToast").asLazy(m => (toasts = m));
export let messageUtil = lookupByProps("sendBotMessage").asLazy(m => (messageUtil = m));
export let navigationStack = lookupByProps("createStackNavigator").asLazy(m => (navigationStack = m));
export let NavigationNative = lookupByProps("NavigationContainer").asLazy(m => (NavigationNative = m));
export let semver = lookupByProps("parse", "clean").asLazy(m => (semver = m));
export let chroma = lookupByProps("brewer").asLazy(m => (chroma = m)) as any;

export let tokens = lookupByProps("unsafe_rawColors", "colors").asLazy(m => (tokens = m));
export let { useToken } = lazyDestructure(() => lookupByProps("useToken").asLazy(m => ({ useToken } = m))) as any;

// Flux
export let Flux = lookupByProps("connectStores").asLazy(m => (Flux = m));
export let FluxDispatcher = lookupByProps("_interceptors").asLazy(m => (FluxDispatcher = m));
export let FluxUtils = lookupByProps("useStateFromStores").asLazy(m => (FluxUtils = m));

// React
export let React = lookupByProps("createElement").asLazy(m => (React = m));

// React Native
export let ReactNative = lookupByProps("AppRegistry").asLazy(m => (ReactNative = m));
export let assetsRegistry = lookupByProps("getAssetByID").asLazy(m => (assetsRegistry = m));
