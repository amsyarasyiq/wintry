import { findByProps } from "../src/metro/api";

export default {
    react: findByProps("createElement"),
    "react-native": findByProps("AppRegistry"),
};
