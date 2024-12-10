import { findByProps } from "../src/metro/api";

function wrap(factory: () => any) {
    const ret = factory();
    const proxy: Record<string, unknown> = new Proxy(
        {},
        {
            get: (_, p) => ret[p],
            getPrototypeOf: () => proxy,
        },
    );

    return proxy;
}

export default {
    "react": wrap(() => findByProps("createElement")),
    "react-native": wrap(() => findByProps("AppRegistry")),
};
