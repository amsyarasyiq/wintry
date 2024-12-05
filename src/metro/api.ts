import { createCacheHandler, iterateModulesForCache } from "./internal/caches";
import type { FilterFn } from "./types";
import { isNotNil, TimeoutError } from "es-toolkit";
import { createLazyModule } from "./lazy";
import { moduleRegistry, waitFor } from "./internal/modules";
import { byDisplayName, byFilePath, byName, byProps, byStoreName, byTypeName } from "./filters";
import { metroEventEmitter } from "./internal/events";

/**
 * @internal
 * Iterates over all modules that match the given filter function.
 * @param filter find calls filter once for each enumerable module's exports.
 * @returns An iterator that yields the export.
 */
export function filterExports<A extends unknown[]>(moduleExports: any, moduleId: number, filter: FilterFn<A>) {
    if (moduleExports.default && moduleExports.__esModule && filter(moduleExports.default, moduleId, true)) {
        return {
            exports: filter.raw ? moduleExports : moduleExports.default,
            resolve: () => (filter.raw ? moduleExports : moduleExports.default),
        };
    }

    if (!filter.raw && filter(moduleExports, moduleId, false)) {
        return { exports: moduleExports, resolve: () => moduleExports };
    }
}

function* _iterateModule<A extends unknown[]>(filter: FilterFn<A>, fullLookup: boolean) {
    const { cacheId, finish } = createCacheHandler(filter.uniq, false);

    for (const [id, moduleExports] of iterateModulesForCache(filter.uniq, fullLookup)) {
        const { exports: testedExports, resolve } = filterExports(moduleExports, id, filter) ?? {};
        if (testedExports !== undefined) {
            cacheId(id, testedExports);
            metroEventEmitter.emit("lookupFound", filter.uniq, moduleRegistry.get(id)!);
            yield { id, resolve };
        }
    }

    finish(true);
}

function _findModule<A extends unknown[]>(filter: FilterFn<A>) {
    return _iterateModule(filter, false).next().value;
}

/**
 * Returns the exports of the first module where filter returns non-undefined, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function find<A extends unknown[]>(filter: FilterFn<A>) {
    return createLazyModule(filter);
}

export function findAsync<A extends unknown[]>(filter: FilterFn<A>, timeout?: number) {
    return new Promise((resolve, reject) => {
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
 * @param {FilterFn<A>} filter - The filter function used to find the module.
 * @returns The ID of the module that matches the filter criteria.
 */
export function findId<A extends unknown[]>(filter: FilterFn<A>) {
    return _findModule(filter)?.id;
}

/**
 * Finds and returns the module ID that matches the given filter function.
 */
export function findAllIds<A extends unknown[]>(filter: FilterFn<A>) {
    return [..._iterateModule(filter, true)].map(({ id }) => id);
}

/**
 * Iterates over all modules that match the given filter function.
 * @param filter find calls filter once for each enumerable module's exports.
 * @returns An iterator that yields the export.
 */
export function* iterate<A extends unknown[]>(filter: FilterFn<A>) {
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
export function findAll<A extends unknown[]>(filter: FilterFn<A>) {
    return [..._iterateModule(filter, true)].map(({ resolve }) => resolve?.()).map(isNotNil);
}

/**
 * Finds a module immediately based on the provided filter function.
 *
 * @template A The type of the arguments that the filter function accepts.
 * @param filter The filter function used to find the module.
 * @returns The resolved module if found, otherwise undefined.
 */
export function findImmediate<A extends unknown[]>(filter: FilterFn<A>) {
    const module = _findModule(filter);
    if (module == null) return;

    return module.resolve?.();
}

export function findByProps(...props: string[]) {
    return find(byProps(...props));
}

/**
 * Searches for a module that contains the specified props.
 * @param args String props to search for.
 */
export function findByPropsAsync(...args: string[]) {
    return findAsync(byProps(...args));
}

export function findByPropsImmediate(...props: string[]) {
    return findImmediate(byProps(...props));
}

export function findByPropsAll(...props: string[]) {
    return findAll(byProps(...props));
}

export function findByName(name: string, expDefault = true) {
    return find(expDefault ? byName(name) : byName.raw(name));
}

export function findByNameAsync(name: string, expDefault = true) {
    return findAsync(expDefault ? byName(name) : byName.raw(name));
}

export function findByNameImmediate(name: string, expDefault = true) {
    return findImmediate(expDefault ? byName(name) : byName.raw(name));
}

export function findByNameAll(name: string, expDefault = true) {
    return findAll(expDefault ? byName(name) : byName.raw(name));
}

export function findByDisplayName(name: string, expDefault = true) {
    return find(expDefault ? byDisplayName(name) : byDisplayName.raw(name));
}

export function findByDisplayNameAsync(name: string, expDefault = true) {
    return findAsync(expDefault ? byDisplayName(name) : byDisplayName.raw(name));
}

export function findByDisplayNameImmediate(name: string, expDefault = true) {
    return findImmediate(expDefault ? byDisplayName(name) : byDisplayName.raw(name));
}

export function findByDisplayNameAll(name: string, expDefault = true) {
    return findAll(expDefault ? byDisplayName(name) : byDisplayName.raw(name));
}

export function findByTypeName(name: string, expDefault = true) {
    return find(expDefault ? byTypeName(name) : byTypeName.raw(name));
}

export function findByTypeNameAsync(name: string, expDefault = true) {
    return findAsync(expDefault ? byTypeName(name) : byTypeName.raw(name));
}

export function findByTypeNameLazy(name: string, expDefault = true) {
    return findImmediate(expDefault ? byTypeName(name) : byTypeName.raw(name));
}

export function findByTypeNameAll(name: string, expDefault = true) {
    return findAll(expDefault ? byTypeName(name) : byTypeName.raw(name));
}

export function findByStoreName(name: string) {
    return find(byStoreName(name));
}

export function findByStoreNameImmediate(name: string) {
    return findImmediate(byStoreName(name));
}

export function findByFilePath(path: string, resolveToDefault = false) {
    return find(byFilePath(path, resolveToDefault));
}

export function findByFilePathImmediate(path: string, expDefault = false) {
    return findImmediate(byFilePath(path, expDefault));
}
