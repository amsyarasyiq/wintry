import { byProps } from "@metro/filters";
import { lookup } from "@metro/new/api";
import { lazyValue } from "@utils/lazy";

const RNGestureHandlerModule = lookup(byProps(["NativeViewGestureHandler"])).asLazy();

export const RNGHScrollView = lazyValue(() => RNGestureHandlerModule.ScrollView);
export const NativeViewGestureHandler = lazyValue(() => RNGestureHandlerModule.NativeViewGestureHandler);
