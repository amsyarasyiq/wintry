import { lazyDestructure } from "../../utils/lazy";
import { findByProps, findByFilePath } from "../api";

// Discord
export const constants = findByProps("Fonts", "Permissions");
export const channels = findByProps("getVoiceChannelId");
export const i18n = findByProps("Messages");
export const url = findByProps("openURL", "openDeeplink");
export const clipboard = findByProps("setString", "getString", "hasString");
export const assets = findByProps("registerAsset");
export const invites = findByProps("acceptInviteAndTransitionToInviteChannel");
export const commands = findByProps("getBuiltInCommands");
export const navigation = findByProps("pushLazy");
export const toasts = findByFilePath("modules/toast/native/ToastActionCreators.tsx", true);
export const messageUtil = findByProps("sendBotMessage");
export const navigationStack = findByProps("createStackNavigator");
export const NavigationNative = findByProps("NavigationContainer");
export const semver = findByProps("parse", "clean");

export const tokens = findByProps("unsafe_rawColors", "colors");
export const { useToken } = lazyDestructure(() => findByProps("useToken"));

// Flux
export const Flux = findByProps("connectStores");
export const FluxDispatcher = findByProps("_interceptors");
export const FluxUtils = findByProps("useStateFromStores");

// React
export const React = (window.React = findByProps("createElement")) as typeof import("react");
export const ReactNative = (window.ReactNative = findByProps("AppRegistry")) as typeof import("react-native");
