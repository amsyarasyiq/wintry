export function getNativeModule<T = any>(...names: string[]): T {
    for (const name of names) {
        const module = global.__turboModuleProxy?.(name);
        if (module) return module as T;

        const legacyModule = global.nativeModuleProxy?.[name];
        if (legacyModule) return legacyModule as T;
    }

    throw new Error(`Native module "${names.join(", ")}" not found.`);
}

// Discord
export const NativeCacheModule = getNativeModule("NativeCacheModule");
export const NativeFileModule = getNativeModule("NativeFileModule");
export const NativeClientInfoModule = getNativeModule("NativeClientInfoModule");
export const NativeDeviceModule = getNativeModule("NativeDeviceModule");
export const BundleUpdaterModule = getNativeModule("BundleUpdaterManager");
export const ThemeModule = getNativeModule("NativeThemeModule");

// React Native
export const ImageLoader = getNativeModule("ImageLoader");
