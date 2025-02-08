import { createModuleFilter, withInteropOptions } from "@metro/new/filters";
import { lookup } from "../api";

interface FluxStore {
    getName(): string;

    [key: string]: any;
}

export const byStoreName = createModuleFilter(
    withInteropOptions<string>({
        filter: ({ a: name, m }) => m.constructor?.displayName === name && m.getName() === name,
        stringify: arg => `byStoreName(${arg})`,
    }),
);

export function getStore(name: string, resolver?: (store: any) => any): FluxStore {
    return lookup(byStoreName(name)).asLazy(resolver) as FluxStore;
}

export let ToastStore = getStore("ToastStore", m => (ToastStore = m));

export let UserStore = getStore("UserStore", m => (UserStore = m));

export let ChannelStore = getStore("ChannelStore", m => (ChannelStore = m));

export let GuildStore = getStore("GuildStore", m => (GuildStore = m));

export let PermissionStore = getStore("PermissionStore", m => (PermissionStore = m));

export let EmojiStore = getStore("EmojiStore", m => (EmojiStore = m));
