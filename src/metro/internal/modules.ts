import { hasIndexInitialized } from "../..";
import { onUntil } from "@utils/events";
import type { Metro, ModuleState } from "../types";
import { createCacheHandler, getAllCachedModuleIds, markExportsFlags, onceCacheReady } from "./caches";
import { metroEvents, modulesInitializationEvents } from "./events";
import type { ModuleFilter } from "@metro/factories";
import { testExports } from "@metro/new/api";

export const moduleRegistry = new Map<number, ModuleState>();
export let _importingModuleId = -1;

/** @internal */
export function internal_getDefiner(
    originalDefiner: Metro.DefineFn,
    onceIndexRequired: (runFactory: () => void) => void,
) {
    return (factory: Metro.FactoryFn, id: Metro.ModuleID, dependencies: Metro.DependencyMap) => {
        const wrappedFactory: Metro.FactoryFn = (...args) => {
            const state = moduleRegistry.get(id)!;

            if (id === 0) {
                onceIndexRequired(() => factory(...args));
                state.initialized = true;

                return;
            }

            const { 1: metroRequire, 4: publicModule } = args;

            // Avoid catching default or named exports
            args[2 /* metroImportDefault */] = id => {
                const exps = metroRequire(id);
                return exps?.__esModule ? exps.default : exps;
            };

            args[3 /* metroImportAll */] = id => {
                const exps = metroRequire(id);
                if (exps?.__esModule) return exps;

                const importAll: Record<string, any> = {};
                if (exps) Object.assign(importAll, exps);
                importAll.default = exps;
                return importAll;
            };

            const originalImportingModuleId = _importingModuleId;
            _importingModuleId = id;

            try {
                factory(...args); // Factory does not return anything
            } catch {
                // Blacklist the module if the factory throws an error
                markExportsFlags(id, undefined);
            }

            _importingModuleId = originalImportingModuleId;

            state.module = publicModule;
            state.initialized = true;

            markExportsFlags(id, publicModule);

            if (!isBadModuleExports(publicModule)) {
                metroEvents.emit("moduleLoaded", state);
                modulesInitializationEvents.emit(id);
            }
        };

        const state: ModuleState = { id, factory, dependencies, initialized: false, meta: {} };
        moduleRegistry.set(id, state);
        metroEvents.emit("moduleDefined", state);

        originalDefiner(wrappedFactory, id, dependencies);
    };
}

export function isBadModuleExports(exports: any) {
    return (
        exports == null ||
        exports === globalThis ||
        exports["<insert the funny here>"] === null || // A proxy which always returns null
        (exports.__proto__ === Object.prototype && Reflect.ownKeys(exports).length === 0)
    );
}

export function patchModule(
    predicate: (module: any, state: ModuleState) => boolean,
    patch: (state: ModuleState) => void,
    { count = 1 } = {},
) {
    let _count = 0;

    onUntil(metroEvents, "moduleLoaded", state => {
        const exports = state.module.exports;
        if (exports && predicate(exports, state)) {
            patch(state);

            if (++_count === count) return true;
        }

        return false;
    });
}

export function waitFor<A, R, O>(
    filter: ModuleFilter<A, R, O>,
    callback: (exports: any, state: ModuleState) => void,
    { count = 1 } = {},
) {
    let currentCount = 0;
    let fulfilled = false;

    onceCacheReady(() => {
        if (fulfilled) return;
        const cachedModuleIds = getAllCachedModuleIds(filter.key);
        const cacheHandler = createCacheHandler(filter.key, false);

        function checkState(state: ModuleState) {
            if (fulfilled) return true;

            const exports = state.module?.exports;
            if (!exports) return false;

            const result = testExports(state.id, exports, filter);
            if (!result) return false;

            cacheHandler.cacheId(state.id, result);
            callback(result, state);

            return (fulfilled = ++currentCount === count);
        }

        // Fast path: check already loaded modules
        if (hasIndexInitialized && cachedModuleIds && cachedModuleIds.length >= count) {
            for (const id of cachedModuleIds) {
                const state = moduleRegistry.get(id);
                if (!state) continue;

                if (state.module?.exports) {
                    if (checkState(state)) return;
                } else {
                    modulesInitializationEvents.once(state.id, () => checkState(state));
                }
            }
        }

        if (!fulfilled) {
            // Fallback: watch for new modules
            onUntil(metroEvents, "moduleLoaded", checkState);
            onUntil(metroEvents, "lookupFound", (key, state) => (filter.key === key ? checkState(state) : false));
        }
    });

    return () => void (fulfilled = true);
}
