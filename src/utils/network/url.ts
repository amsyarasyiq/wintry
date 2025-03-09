import { lookupByProps } from "@metro/common/wrappers";

let urlModule = lookupByProps("openURL", "openDeeplink").asLazy(m => (urlModule = m));

export function openURL(url: string) {
    urlModule.openURL(url);
}
