declare global {
    // Build constants
    const __DEV__: boolean;

    // ReactNative/Hermes globals
    var __turboModuleProxy: (name: string) => unknown;
    var nativePerformanceNow: typeof performance.now;
    var nativeModuleProxy: Record<string, any>;

    var WINTRY_START_TIME: number;

    interface Window {
        [key: string]: any;
        wintry: any;
    }
}

export {};
