import { byProps } from "../src/metro/common/filters";
import { lookup } from "../src/metro/api";
import { createLazyImportProxy as wrap } from "../src/utils/lazy";

let React = lookup(byProps(["createElement"])).asLazy(r => (React = r));
let ReactNative = lookup(byProps(["AppRegistry"])).asLazy(r => (ReactNative = r));
let Reanimated = lookup(byProps(["useSharedValue", "useAnimatedStyle", "FadeInUp"])).asLazy(r => (Reanimated = r));
let GestureHandler = lookup(byProps(["gestureHandlerRootHOC"])).asLazy(r => (GestureHandler = r));
let FlashList = lookup(byProps(["FlashList"])).asLazy(r => (FlashList = r));

// biome-ignore format: To appear more consistent
export default {
    "react": wrap(() => React),
    "react-native": wrap(() => ReactNative),
    "react-native-reanimated": wrap(() => Reanimated),
    "react-native-gesture-handler": wrap(() => GestureHandler),
    "@shopify/flash-list": wrap(() => FlashList),
};
