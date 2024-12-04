import { debounce } from "es-toolkit";

import { ModuleFlags, ModulesMapInternal } from "./enums";
import { isModuleExportsBad } from "./modules";
import { lazyDestructure } from "../../utils/lazy";

const { ClientInfoModule, MMKVModule } = lazyDestructure(() => require("../../native"));

const CACHE_VERSION = Math.random().toString(36).slice(2, 8);
const WINTRY_METRO_CACHE_KEY = "__wintry_metro_cache_key__";

type ModulesMap = {
    [flag in number | `_${ModulesMapInternal}`]?: ModuleFlags;
};

let _metroCache = null as unknown as ReturnType<typeof initializeCache>;

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
    const rawCache = await MMKVModule.getItem(WINTRY_METRO_CACHE_KEY);

    try {
        _metroCache = JSON.parse(rawCache);
        if (_metroCache._version !== CACHE_VERSION || _metroCache._buildNumber !== ClientInfoModule.Build) {
            throw "cache invalidated";
        }
    } catch {
        initializeCache();
    }
}

const storeMetroCache = debounce(() => {
    MMKVModule.setItem(WINTRY_METRO_CACHE_KEY, JSON.stringify(_metroCache));
}, 1000);

function getModuleExportFlags(moduleExports: any) {
    let bit = ModuleFlags.EXISTS;
    if (isModuleExportsBad(moduleExports)) bit |= ModuleFlags.BLACKLISTED;

    return bit;
}

/** @internal */
export function indexExportsFlags(moduleId: number, moduleExports: any) {
    const flags = getModuleExportFlags(moduleExports);
    if (flags !== ModuleFlags.EXISTS) {
        _metroCache.moduleIndex[moduleId] = flags;
    }
}

/** @internal */
export function indexBlacklistFlag(id: number) {
    _metroCache.moduleIndex[id] |= ModuleFlags.BLACKLISTED;
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
