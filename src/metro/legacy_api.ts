import { TimeoutError, isNotNil } from "es-toolkit";
import { byDisplayName, byFilePath, byName, byProps, byStoreName, byTypeName } from "./filters";
import { createCacheHandler, iterateModulesForCache } from "./internal/caches";
import { metroEvents } from "./internal/events";
import { moduleRegistry, waitFor } from "./internal/modules";
import { createLazyModule } from "./lazy";
import type { InteropOption, ModuleFilter } from "./factories";
import { SynchronousPromise } from "synchronous-promise";
import { lookup } from "./new/api";

/**
 * @internal
 * Iterates over all modules that match the given filter function.
 * @param filter find calls filter once for each enumerable module's exports.
 * @returns An iterator that yields the export.
 */
export function filterExports<A, R, O>(moduleExports: any, moduleId: number, filter: ModuleFilter<A, R, O>) {
    for (const resolve of filter.resolvers) {
        const resolved = resolve(moduleExports);
        if (!resolved) continue;

        if (filter.check(moduleId, resolved)) {
            return { exports: resolved, resolve: () => resolved };
        }
    }
}

function* _iterateModule<A, R, O>(filter: ModuleFilter<A, R, O>, fullLookup: boolean) {
    const { cacheId, finish } = createCacheHandler(filter.key, false);

    for (const [id, moduleExports] of iterateModulesForCache(filter.key, fullLookup)) {
        const { exports: testedExports, resolve } = filterExports(moduleExports, id, filter) ?? {};
        if (testedExports !== undefined) {
            cacheId(id, testedExports);
            metroEvents.emit("lookupFound", filter.key, moduleRegistry.get(id)!);
            yield { id, resolve };
        }
    }

    finish(true);
}

function _findModule<A, R, O>(filter: ModuleFilter<A, R, O>) {
    return _iterateModule(filter, false).next().value;
}

/**
 * Returns the exports of the first module where filter returns non-undefined, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function find<A, R, O>(filter: ModuleFilter<A, R, O>) {
    return createLazyModule(filter);
}

export function findAsync<A, R, O>(filter: ModuleFilter<A, R, O>, timeout?: number) {
    return new SynchronousPromise<R>((resolve, reject) => {
        let timer: Timer | undefined;
        if (timeout !== undefined) timer = setTimeout(() => reject(new TimeoutError("Timed out")), timeout);

        waitFor(filter, exports => {
            timer && clearTimeout(timer);
            resolve(exports);
        });
    });
}

/**
 * Finds and returns the module ID that matches the given filter function.
 *
 * @template A - The type of the arguments that the filter function accepts.
 * @param {ModuleFilter<A>} filter - The filter function used to find the module.
 * @returns The ID of the module that matches the filter criteria.
 */
export function findId<A, R, O>(filter: ModuleFilter<A, R, O>) {
    return _findModule(filter)?.id;
}

/**
 * Finds and returns the module ID that matches the given filter function.
 */
export function findAllIds<A, R, O>(filter: ModuleFilter<A, R, O>) {
    return [..._iterateModule(filter, true)].map(({ id }) => id);
}

/**
 * Iterates over all modules that match the given filter function.
 * @param filter find calls filter once for each enumerable module's exports.
 * @returns An iterator that yields the export.
 */
export function* iterate<A, R, O>(filter: ModuleFilter<A, R, O>) {
    for (const { resolve } of _iterateModule(filter, true)) {
        const exports = resolve?.();
        if (exports) yield exports;
    }
}

/**
 * Returns an array of all modules that match the given filter function.
 * @param filter find calls filter once for each enumerable module's exports.
 * @returns
 */
export function findAll<A, R, O>(filter: ModuleFilter<A, R, O>) {
    return [..._iterateModule(filter, true)].map(({ resolve }) => resolve?.()).filter(isNotNil);
}

/**
 * Finds a module immediately based on the provided filter function.
 *
 * @template A The type of the arguments that the filter function accepts.
 * @param filter The filter function used to find the module.
 * @returns The resolved module if found, otherwise undefined.
 */
export function findImmediate<A, R, O>(filter: ModuleFilter<A, R, O>) {
    const module = _findModule(filter);
    if (module == null) return;

    return module.resolve?.();
}

export function findByProps<T extends string>(...props: T[]) {
    return lookup(byProps(props)).asLazy();
}

/**
 * Searches for a module that contains the specified props.
 * @param args String props to search for.
 */
export function findByPropsAsync<T extends string>(...args: T[]) {
    return lookup(byProps(args)).await();
}

export function findByPropsImmediate<T extends string>(...props: T[]) {
    return lookup(byProps(props)).load();
}

export function findByPropsAll(...props: string[]) {
    return findAll(byProps(props));
}

function createInteropOption(expDefault: boolean): InteropOption | undefined {
    return { returnEsmDefault: expDefault };
}

export function findByName(name: string, expDefault = true) {
    return lookup(byName(name, createInteropOption(expDefault))).asLazy();
}

export function findByNameAsync(name: string, expDefault = true) {
    return lookup(byName(name, createInteropOption(expDefault))).await();
}

export function findByNameImmediate(name: string, expDefault = true) {
    return lookup(byName(name, createInteropOption(expDefault))).load();
}

export function findByNameAll(name: string, expDefault = true) {
    return lookup(byName(name, createInteropOption(expDefault)));
}

export function findByDisplayName(name: string, expDefault = true) {
    return lookup(byDisplayName(name, createInteropOption(expDefault))).asLazy();
}

export function findByDisplayNameAsync(name: string, expDefault = true) {
    return lookup(byDisplayName(name, createInteropOption(expDefault))).await();
}

export function findByDisplayNameImmediate(name: string, expDefault = true) {
    return lookup(byDisplayName(name, createInteropOption(expDefault))).load();
}

export function findByDisplayNameAll(name: string, expDefault = true) {
    return findAll(byDisplayName(name, createInteropOption(expDefault)));
}

export function findByTypeName(name: string, expDefault = true) {
    return lookup(byTypeName(name, createInteropOption(expDefault))).asLazy();
}

export function findByTypeNameAsync(name: string, expDefault = true) {
    return lookup(byTypeName(name, createInteropOption(expDefault))).await();
}

export function findByTypeNameImmediate(name: string, expDefault = true) {
    return lookup(byTypeName(name, createInteropOption(expDefault))).load();
}

export function findByTypeNameAll(name: string, expDefault = true) {
    return findAll(byTypeName(name, createInteropOption(expDefault)));
}

export function findByStoreName(name: string) {
    return lookup(byStoreName(name)).asLazy();
}

export function findByStoreNameImmediate(name: string) {
    return lookup(byStoreName(name)).load();
}

export function findByFilePath(path: string, resolveToDefault = false) {
    return lookup(byFilePath(path, { checkEsmDefault: resolveToDefault })).asLazy();
}

export function findByFilePathImmediate(path: string, resolveToDefault = false) {
    return lookup(byFilePath(path, { checkEsmDefault: resolveToDefault })).load();
}
