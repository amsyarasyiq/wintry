import { createModuleFilter, withInteropOptions } from "@metro/new/filters";
import { lookup } from "../api";
import type * as S from "discord-types/stores";

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

export let UserStore = getStore("UserStore", m => (UserStore = m)) as S.UserStore;
export let ChannelStore = getStore("ChannelStore", m => (ChannelStore = m)) as S.ChannelStore;
export let GuildStore = getStore("GuildStore", m => (GuildStore = m)) as S.GuildStore;

export let ToastStore = getStore("ToastStore", m => (ToastStore = m));

export let PermissionStore = getStore("PermissionStore", m => (PermissionStore = m));

export let EmojiStore = getStore("EmojiStore", m => (EmojiStore = m));
