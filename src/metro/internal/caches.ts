import { requireModule } from "..";
import { hasIndexInitialized } from "../..";
import { kvStorage } from "@utils/kvStorage";
import { NativeClientInfoModule } from "../../native";
import { ModuleFlags, ModulesMapInternal } from "./enums";
import { metroEventEmitter } from "./events";
import { isBadModuleExports, moduleRegistry } from "./modules";

const CACHE_VERSION = 1;
const WINTRY_METRO_CACHE_KEY = "__wintry_metro_cache_key__";

type ModulesMap = {
    [flag in number | `_${ModulesMapInternal}`]?: ModuleFlags;
};

export type MetroCache = ReturnType<typeof initializeCache>;
let _metroCache = null! as MetroCache;

// TODO: Remove global getter
export const getMetroCache = () => _metroCache;

function initializeCache() {
    const cache = {
        _version: CACHE_VERSION,
        _buildNumber: NativeClientInfoModule.Build as number,
        moduleIndex: {} as Record<string, number>,
        lookupIndex: {} as Record<string, ModulesMap | undefined>,
    } as const;

    return cache;
}

/** @internal */
export function setupMetroCache() {
    const rawCache = kvStorage.getItem(WINTRY_METRO_CACHE_KEY);

    try {
        const parsedCache = JSON.parse(rawCache!); // If it fails, it will throw
        if (parsedCache._version !== CACHE_VERSION || parsedCache._buildNumber !== NativeClientInfoModule.Build) {
            throw "cache invalidated";
        }

        _metroCache = parsedCache;
        metroEventEmitter.emit("cacheLoaded", _metroCache);
        return parsedCache;
    } catch {
        _metroCache = initializeCache();
        metroEventEmitter.emit("cacheLoaded", _metroCache);
        return _metroCache;
    }
}

function storeMetroCache() {
    kvStorage.setItem(WINTRY_METRO_CACHE_KEY, JSON.stringify(_metroCache));
}

function getModuleExportFlags(moduleExports: any) {
    let bit = ModuleFlags.EXISTS;
    if (isBadModuleExports(moduleExports)) bit |= ModuleFlags.BLACKLISTED;

    return bit;
}

/**
 * @internal
 * Marks the module as blacklisted if the exports are bad.
 * Set moduleExports to undefined to blacklist the module.
 */
export function markExportsFlags(moduleId: number, moduleExports: any) {
    const flags = getModuleExportFlags(moduleExports);
    if (flags !== ModuleFlags.EXISTS) {
        _metroCache.moduleIndex[moduleId] = flags;
    }
}

export function isModuleBlacklisted(moduleId: number): boolean {
    return (_metroCache.moduleIndex[moduleId] & ModuleFlags.BLACKLISTED) !== 0;
}

/** @internal */
export function createCacheHandler(uniq: string, allFind: boolean) {
    const indexObject = (_metroCache.lookupIndex[uniq] ??= {});

    return {
        cacheId(moduleId: number, exports: any) {
            indexObject[moduleId] ??= getModuleExportFlags(exports);

            storeMetroCache();
        },
        // Finish may not be called by single find
        finish(notFound: boolean) {
            if (allFind) indexObject[`_${ModulesMapInternal.FULL_LOOKUP}`] = 1;
            if (notFound) indexObject[`_${ModulesMapInternal.NOT_FOUND}`] = 1;

            storeMetroCache();
        },
    };
}

export function* iterateModulesForCache(uniq: string, fullLookup: boolean) {
    let cache = _metroCache.lookupIndex[uniq];

    if (fullLookup && !cache?.[`_${ModulesMapInternal.FULL_LOOKUP}`]) cache = undefined;
    if (cache?.[`_${ModulesMapInternal.NOT_FOUND}`]) return;

    for (const id in cache) {
        if (id[0] === "_") continue;
        const exports = Number(id);
        if (isBadModuleExports(exports)) continue;
        yield [id, exports];
    }

    for (const [id, state] of moduleRegistry) {
        let exports: any;
        try {
            if (isModuleBlacklisted(id)) continue;
            if (__DEV__ && !state.initialized && !hasIndexInitialized)
                throw new Error(`Module '${id}' is getting forcefully initialized before the index module!`);

            exports = requireModule(id);
        } catch { }

        if (isBadModuleExports(exports)) continue;
        yield [id, exports];
    }
}

export function getAllCachedModuleIds(uniq: string) {
    const modulesMap = _metroCache.lookupIndex[uniq];
    if (!modulesMap) return undefined;

    const moduleIds = [] as Array<number>;
    for (const index in modulesMap) {
        if (!Number.isNaN(index)) moduleIds.push(Number(index));
    }

    return moduleIds;
}

export function onceCacheReady(callback: (cache: MetroCache) => void) {
    if (_metroCache) {
        callback(_metroCache);
    } else {
        metroEventEmitter.once("cacheLoaded", callback);
    }
}
