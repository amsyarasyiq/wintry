import type { ModuleState } from "../types";
import { createCacheHandler, getAllCachedModuleIds, isModuleBlacklisted } from "./caches";
import { metroEvents, modulesInitializationEvents } from "./events";
import type { ModuleFilter } from "@metro/filters";
import { testExports } from "@metro/api";
import { initializedModuleRegistry, moduleRegistry } from "./registry";

export function isBadModuleExports(exports: any) {
    const RANDOM_STRING = "insert the funny here? :fuyusquish:";

    return (
        exports == null ||
        exports === globalThis ||
        (exports.__proto__ === Object.prototype && Reflect.ownKeys(exports).length === 0) || // Empty object, implies no exports
        // Blacklist evil proxies which always return non-undefined. For example, IntlMessagesProxy or NativeModules.
        exports[RANDOM_STRING] !== undefined ||
        exports.default?.[RANDOM_STRING] !== undefined
    );
}

export function waitFor<A, R, O>(
    filter: ModuleFilter<A, R, O>,
    callback: (exports: any, state: ModuleState) => void,
    { count = 1 } = {},
) {
    let currentCount = 0;

    const onAbort: Array<() => void> = [];
    let cleanup: (() => void) | null = () => {
        for (const handler of onAbort) handler();
        cleanup = null;
    };

    const cachedModuleIds = getAllCachedModuleIds(filter.key);
    const cacheHandler = createCacheHandler(filter.key, false);

    function checkState(state: ModuleState) {
        if (!cleanup) return true;

        const exports = state.module.exports;
        if (isBadModuleExports(exports) || isModuleBlacklisted(state.id)) {
            return false;
        }

        const result = testExports(state.id, exports, filter);
        if (!result) return false;

        cacheHandler.cacheId(state.id, result);
        callback(result, state);

        if (++currentCount === count) {
            cleanup();
            return true;
        }

        return false;
    }

    if (cachedModuleIds && cachedModuleIds.length >= count) {
        for (const id of cachedModuleIds) {
            const state = moduleRegistry.get(id);
            if (!state) continue;

            if (state.module?.exports) {
                if (checkState(state)) return cleanup;
            } else {
                const cb = () => checkState(state);
                modulesInitializationEvents.once(state.id, cb);
                onAbort.push(() => modulesInitializationEvents.off(state.id, cb));
            }
        }
    } else if (cleanup) {
        // Check already loaded modules
        for (const state of initializedModuleRegistry) {
            if (checkState(state)) return cleanup;
        }

        const moduleLoadedHandler = (state: ModuleState) => checkState(state);
        const lookupFoundHandler = (key: string, state: ModuleState) =>
            filter.key === key ? checkState(state) : false;

        metroEvents.on("moduleLoaded", moduleLoadedHandler);
        metroEvents.on("lookupFound", lookupFoundHandler);

        onAbort.push(
            () => metroEvents.off("moduleLoaded", moduleLoadedHandler),
            () => metroEvents.off("lookupFound", lookupFoundHandler),
        );
    }

    return cleanup;
}
