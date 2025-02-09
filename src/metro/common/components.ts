import { lazyDestructure, lazyValue } from "@utils/lazy";
import { byProps, bySingularProp } from "@metro/new/common/filters";
import { lookup } from "@metro/new/api";
import { lookupByProps } from "@metro/new/common/wrappers";
const findSingular = (prop: string) => lazyValue(() => lookup(bySingularProp(prop)).load()[prop]);
export const findProp = (...prop: string[]) => lazyValue(() => lookup(byProps(prop)).load()[prop[0]]);

// React Native's included SafeAreaView only adds padding on iOS.
export let { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = lazyDestructure(() =>
    lookupByProps("useSafeAreaInsets").asLazy(m => ({ SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = m)),
) as any;

// Misc.
export const Avatar = findProp("default", "AvatarSizes", "getStatusSize");
