import type { ModuleFilter } from "./filters";
import { createCacheHandler, iterateModulesForCache } from "./internal/caches";
import { metroEvents } from "./internal/events";
import { moduleRegistry } from "./internal/registry";
import { SingleMetroModule } from "./module";

/**
 * @internal
 * Iterates over all modules that match the given filter function.
 * @param filter find calls filter once for each enumerable module's exports.
 * @returns An iterator that yields the export.
 */
export function testExports<A, R, O>(
    moduleId: number,
    moduleExports: any,
    filter: ModuleFilter<A, R, O>,
): R | undefined {
    for (const resolve of filter.resolvers) {
        const resolved = resolve(moduleExports);
        if (!resolved) continue;

        if (filter.check(moduleId, resolved)) {
            return resolved;
        }
    }
}

function* _iterateModule<A, R, O>(filter: ModuleFilter<A, R, O>, fullLookup: boolean) {
    const { cacheId, finish } = createCacheHandler(filter.key, fullLookup);

    for (const [id, moduleExports] of iterateModulesForCache(filter.key, fullLookup)) {
        const resolved = testExports(id, moduleExports, filter);
        if (resolved !== undefined) {
            cacheId(id, resolved);
            metroEvents.emit("lookupFound", filter.key, moduleRegistry.get(id)!);
            yield { id, resolved };
        }
    }

    finish(true);
    return undefined;
}

function _findModule<A, R, O>(filter: ModuleFilter<A, R, O>): { id: number; resolved: R } | undefined {
    return _iterateModule(filter, false).next().value;
}

/**
 * Returns the exports of the first module where filter returns non-undefined, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findIdAndResolved<A, R, O>(filter: ModuleFilter<A, R, O>) {
    return _findModule(filter);
}

/**
 * Creates a new module lookup instance.
 */
export function lookup<A, R, O>(filter: ModuleFilter<A, R, O>) {
    return new SingleMetroModule(filter);
}
