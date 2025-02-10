import { lookupByProps } from "@metro/new/common/wrappers";
import { lazyDestructure } from "@utils/lazy";

export let { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = lazyDestructure(() =>
    lookupByProps("useSafeAreaInsets").asLazy(m => ({ SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = m)),
) as any;
