import { hasIndexInitialized } from "../..";
import { onUntil } from "../../utils/events";
import { filterExports } from "../api";
import type { FilterFn, Metro, ModuleExports, ModuleState } from "../types";
import { createCacheHandler, getAllCachedModuleIds, markExportsFlags, onceCacheReady } from "./caches";
import { metroEventEmitter } from "./events";

// TODO: Remove the global exposure
export const moduleRegistry = (window.modules = new Map<number, ModuleState>());
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
                metroEventEmitter.emit("moduleLoaded", state);
            }
        };

        const state: ModuleState = { id, factory, dependencies, initialized: false, meta: {} };
        moduleRegistry.set(id, state);
        metroEventEmitter.emit("moduleDefined", state);

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

    onUntil(metroEventEmitter, "moduleLoaded", state => {
        const exports = state.module.exports;
        if (exports && predicate(exports, state)) {
            patch(state);

            if (++_count === count) return true;
        }

        return false;
    });
}

export function waitFor<A extends unknown[]>(
    filter: FilterFn<A>,
    callback: (exports: ModuleExports, state: ModuleState) => void,
    { count = 1 } = {},
) {
    let currentCount = 0;
    let fulfilled = false; // Also acts as a cancellation flag

    onceCacheReady(() => {
        if (fulfilled) return;
        const moduleIds = getAllCachedModuleIds(filter.uniq);

        function checkState(state: ModuleState) {
            if (fulfilled) return true;

            const { resolve } = (state.module?.exports && filterExports(state.module?.exports, state.id, filter)) || {};
            if (resolve) {
                createCacheHandler(filter.uniq, false).cacheId(state.id, resolve());

                callback(resolve(), state);
                if (++currentCount === count) return (fulfilled = true);
            }

            return false;
        }

        // Only check the already loaded modules if the index has been initialized
        if (hasIndexInitialized) {
            for (const state of moduleRegistry.values()) {
                if (state.module?.exports && filter(state.module?.exports, state.id, true)) {
                    if (checkState(state)) return () => void 0; // Can't cancel this anymore
                }
            }
        }

        onUntil(metroEventEmitter, "lookupFound", (uniq, state) => {
            if (fulfilled) return true;
            if (filter.uniq === uniq && filter(state.module?.exports, state.id, true)) {
                return checkState(state);
            }

            return false;
        });

        if (moduleIds && moduleIds.length >= count) {
            for (const id of moduleIds) {
                const state = moduleRegistry.get(id)!; // We have other problems if this is undefined

                if (state.module?.exports) {
                    if (checkState(state)) break;
                } else {
                    onUntil(metroEventEmitter, "moduleLoaded", state => {
                        if (fulfilled) return true;

                        if (state.id === id) {
                            return checkState(state);
                        }

                        return false;
                    });
                }
            }
        } else {
            onUntil(metroEventEmitter, "moduleLoaded", state => {
                return checkState(state);
            });
        }
    });

    return () => void (fulfilled = true);
}
