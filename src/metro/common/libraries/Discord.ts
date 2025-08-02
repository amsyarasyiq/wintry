import { lazyDestructure } from "@utils/lazy";
import { lookupByProps } from "../wrappers";

// Discord
export let constants = lookupByProps("Fonts", "Permissions").asLazy(m => (constants = m));
export let i18n = lookupByProps("Messages").asLazy(m => (i18n = m));
export let tokens = lookupByProps("unsafe_rawColors", "colors").asLazy(m => (tokens = m));
export let { useToken } = lazyDestructure(() => lookupByProps("useToken").asLazy(m => ({ useToken } = m))) as any;
export let MessageActions = lookupByProps("sendMessage", "receiveMessage").asLazy(m => (MessageActions = m));
export let Clyde = lookupByProps("createBotMessage").asLazy(m => (Clyde = m));
