interface InitConfig {
    baseUrl: string;
}

interface LoaderConstants {
    DEFAULT_BASE_URL: string;
}

interface LoaderModule {
    functions: {
        [functionName: string]: number;
    };
    constants: {
        [constantName: string]: any;
    };
}

interface LoaderModules {
    [moduleName: string]: LoaderModule;
}

interface LoaderPayload {
    name: string;
    version: string;
    initConfig: InitConfig;
    constants: LoaderConstants;
    modules: LoaderModules;
    preload: Record<string, string>;
}

type InteropReturn = Promise<{ ret: string } | { err: string }>;

export const LoaderPayload = window.__WINTRY_LOADER__.loader as LoaderPayload;

export function isModuleRegistered(module: string) {
    return LoaderPayload.modules[module];
}

export function isFunctionRegistered(module: string, function_: string) {
    console.log(LoaderPayload?.modules?.[module]?.functions?.[function_], {
        module,
        function_,
        functions: LoaderPayload.modules
    });
    return LoaderPayload.modules[module]?.functions[function_] !== undefined;
}

export async function callFunction(module: string, function_: string, args: unknown[]) {
    if (!isFunctionRegistered(module, function_)) {
        throw new Error(`Function ${module}.${function_} is not registered`);
    }

    const { queryCache } = window.nativeModuleProxy.ImageLoader;
    const promise: InteropReturn = queryCache(["__wintry_bridge", JSON.stringify({ m: module, f: function_, a: args })]);

    const result = await promise;

    if ("ret" in result) {
        return JSON.parse(result.ret);
    }

    if ("err" in result) {
        throw new Error(result.err);
    }
}