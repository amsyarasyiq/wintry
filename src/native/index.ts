import { lazyValue } from "@utils/lazy";

function getModule<T = any>(...names: string[]): T {
    const moduleProxy = window.nativeModuleProxy;
    return lazyValue(
        () => {
            const module = names.find(name => moduleProxy[name] !== null)!;
            return moduleProxy[module];
        },
        { hint: "object" },
    );
}

// Names are based on 259204 (Android), this is probably not the same on iOS
export const NativeCacheModule = getModule("NativeCacheModule");
export const NativeFileModule = getModule("NativeFileModule");
export const NativeClientInfoModule = getModule("NativeClientInfoModule");
export const NativeDeviceModule = getModule("NativeDeviceModule");
export const BundleUpdaterModule = getModule("BundleUpdaterManager");
export const ThemeModule = getModule("NativeThemeModule");
