import { findByPropsImmediate as findByProps } from "../src/metro/api";
import { lazyObjectGetter as wrap } from "../src/utils/lazy";

// biome-ignore format: To appear more consistent
export default {
    "react": wrap(() => findByProps("createElement")),
    "react-native": wrap(() => findByProps("AppRegistry")),
};
