import { byStoreName } from "@metro/filters";
import { lookup } from "./api";

function getStore(name: string, resolver: (store: any) => any) {
    return lookup(byStoreName(name)).asLazy(m => resolver(m));
}

export let ToastStore = getStore("ToastStore", m => (ToastStore = m));
export let UserStore = getStore("UserStore", m => (UserStore = m));
export let ChannelStore = getStore("ChannelStore", m => (ChannelStore = m));
export let GuildStore = getStore("GuildStore", m => (GuildStore = m));
export let PermissionStore = getStore("PermissionStore", m => (PermissionStore = m));
export let EmojiStore = getStore("EmojiStore", m => (EmojiStore = m));
