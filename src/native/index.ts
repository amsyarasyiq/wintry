import { proxyLazy } from "../utils/lazy";

function getModule<T = any>(...names: string[]): T {
    const moduleProxy = window.nativeModuleProxy;
    return proxyLazy(() => moduleProxy[names.find(name => moduleProxy[name] !== null)!]);
}

// Names are based on 259204 (Android), this is probably not the same on iOS
export const CacheModule = getModule("NativeCacheModule");
export const FileModule = getModule("NativeFileModule");
export const ClientInfoModule = getModule("NativeClientInfoModule");
export const DeviceModule = getModule("NativeDeviceModule");
export const BundleUpdaterModule = getModule("BundleUpdaterManager");
export const ThemeModule = getModule("NativeThemeModule");
