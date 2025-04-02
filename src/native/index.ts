export function getNativeModule<T = any>(...names: string[]): T {
    const moduleProxy = window.nativeModuleProxy;
    const module = names.find(name => moduleProxy[name] !== null)!;
    return moduleProxy[module];
}

// Names are based on 259204 (Android), this is probably not the same on iOS
export const NativeCacheModule = getNativeModule("NativeCacheModule");
export const NativeFileModule = getNativeModule("NativeFileModule");
export const NativeClientInfoModule = getNativeModule("NativeClientInfoModule");
export const NativeDeviceModule = getNativeModule("NativeDeviceModule");
export const BundleUpdaterModule = getNativeModule("BundleUpdaterManager");
export const ThemeModule = getNativeModule("NativeThemeModule");
