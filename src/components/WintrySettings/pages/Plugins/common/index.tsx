import { findByProps } from "../../../../../metro";
import { lazyValue } from "../../../../../utils/lazy";

const RNGestureHandlerModule = findByProps("NativeViewGestureHandler");

export const RNGHScrollView = lazyValue(() => RNGestureHandlerModule.ScrollView);
