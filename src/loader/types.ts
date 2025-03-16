export interface InitConfig {
    baseUrl: string;
    forceUpdate: boolean;
    skipUpdate: boolean;
    bundlePath: string | null;
    safeMode: boolean;
}

interface LoaderConstants {
    WINTRY_DIR: string;
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

export interface LoaderPayload {
    bundle: {
        revision: string;
    };
    loader: {
        name: string;
        version: string;
        initConfig: InitConfig;
        constants: LoaderConstants;
        modules: LoaderModules;
    };
}
