import { lazyValue } from "@utils/lazy";
import { lookupByProps } from "@metro/new/common/wrappers";

const RNGestureHandlerModule = lookupByProps("NativeViewGestureHandler").asLazy();

export const RNGHScrollView = lazyValue(() => RNGestureHandlerModule.ScrollView);
export const NativeViewGestureHandler = lazyValue(() => RNGestureHandlerModule.NativeViewGestureHandler);
