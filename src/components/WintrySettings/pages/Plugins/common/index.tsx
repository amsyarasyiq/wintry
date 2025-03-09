import { lazyValue } from "@utils/lazy";
import { lookupByProps } from "@metro/common/wrappers";

const RNGestureHandlerModule = lookupByProps("NativeViewGestureHandler", "ScrollView").asLazy();

export const RNGHScrollView = lazyValue(() => RNGestureHandlerModule.ScrollView);
export const NativeViewGestureHandler = lazyValue(() => RNGestureHandlerModule.NativeViewGestureHandler);
