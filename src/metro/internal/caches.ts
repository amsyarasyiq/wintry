import { debounce } from "es-toolkit";

import { ModuleFlags, ModulesMapInternal } from "./enums";
import { isBadModuleExports, moduleRegistry } from "./modules";
import { lazyDestructure } from "../../utils/lazy";
import { requireModule } from "..";
import { metroEventEmitter } from "./events";
import { hasIndexInitialized } from "../..";

const { ClientInfoModule, CacheModule } = lazyDestructure(() => require("../../native"));

const CACHE_VERSION = Math.random().toString(36).slice(2, 8);
const WINTRY_METRO_CACHE_KEY = "__wintry_metro_cache_key__";

type ModulesMap = {
    [flag in number | `_${ModulesMapInternal}`]?: ModuleFlags;
};

export type MetroCache = ReturnType<typeof initializeCache>;
let _metroCache = null! as MetroCache;

// TODO: Remove global getter
export const getMetroCache = (window.__getMetroCache = () => _metroCache);

function initializeCache() {
    const cache = {
        _version: CACHE_VERSION,
        _buildNumber: ClientInfoModule.Build as number,
        moduleIndex: {} as Record<string, number>,
        lookupIndex: {} as Record<string, ModulesMap | undefined>,
    } as const;

    _metroCache = cache;
    return cache;
}

/** @internal */
export async function setupMetroCache() {
    // TODO: Store in file system... is a better idea?
    const rawCache = await CacheModule.getItem(WINTRY_METRO_CACHE_KEY);

    try {
        _metroCache = JSON.parse(rawCache);
        if (_metroCache._version !== CACHE_VERSION || _metroCache._buildNumber !== ClientInfoModule.Build) {
            throw "cache invalidated";
        }

        metroEventEmitter.emit("cacheLoaded", _metroCache);
    } catch {
        initializeCache();
    }
}

const storeMetroCache = debounce(() => {
    CacheModule.setItem(WINTRY_METRO_CACHE_KEY, JSON.stringify(_metroCache));
}, 1000);

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
        } catch {}

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
