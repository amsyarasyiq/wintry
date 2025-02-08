import { findByPropsImmediate as findByProps } from "../src/metro/legacy_api";
import { lazyObjectGetter as wrap } from "../src/utils/lazy";

// biome-ignore format: To appear more consistent
export default {
    "react": wrap(() => findByProps("createElement")),
    "react-native": wrap(() => findByProps("AppRegistry")),
    "react-native-reanimated": wrap(() => findByProps("useSharedValue", "useAnimatedStyle")),
    "react-native-gesture-handler": wrap(() => findByProps("gestureHandlerRootHOC")),
};
