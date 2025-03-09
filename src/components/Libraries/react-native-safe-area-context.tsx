import { lookupByProps } from "@metro/common/wrappers";
import { lazyDestructure } from "@utils/lazy";

export let { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = lazyDestructure(() =>
    lookupByProps("useSafeAreaInsets", "SafeAreaView", "SafeAreaProvider").asLazy(
        m => ({ SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = m),
    ),
) as any;
