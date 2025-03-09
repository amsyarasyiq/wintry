import { kvStorage } from "@utils/kvStorage";
import { NativeClientInfoModule } from "../../native";
import { ModuleFlags, ModulesMapInternal } from "./enums";
import { isBadModuleExports } from "./modules";
import { moduleRegistry } from "./registry";
import { debounce } from "es-toolkit";

const CACHE_VERSION = 1;
const WINTRY_METRO_CACHE_KEY = "__wintry_metro_cache_key__";

type BoolAsNumber = 0 | 1;
type SerializableModulesMap = {
    // [fullLookup, notFound]
    _: [BoolAsNumber, BoolAsNumber];
    [flag: number]: ModuleFlags | undefined;
};

type ModulesMap = Map<number, ModuleFlags> & {
    fullLookup: boolean;
    notFound: boolean;
};

export interface MetroCache {
    version: number;
    moduleFlags: Map<number, ModuleFlags>;
    lookupIndex: Map<string, ModulesMap | undefined>;

    save(): void;
    invalidate(): void;
}

interface SerializedMetroCache {
    v: {
        cache: number;
        bundle: number;
    };
    moduleFlags: Record<string, ModuleFlags>;
    lookupIndex: Record<string, SerializableModulesMap | undefined>;
}

export const MetroCache = setupMetroCache();

function setupMetroCache() {
    let serialized: SerializedMetroCache;

    try {
        serialized = JSON.parse(kvStorage.getItem(WINTRY_METRO_CACHE_KEY)!);
        if (serialized.v.cache !== CACHE_VERSION || serialized.v.bundle !== NativeClientInfoModule.Build)
            throw new Error("Cache version mismatch");
    } catch {
        serialized = {
            v: {
                cache: CACHE_VERSION,
                bundle: NativeClientInfoModule.Build as number,
            },
            moduleFlags: {},
            lookupIndex: {},
        };
    }

    const cache: MetroCache = {
        version: serialized.v.cache,
        moduleFlags: new Map(Object.entries(serialized.moduleFlags).map(([k, v]) => [Number(k), v])),
        lookupIndex: new Map(
            Object.entries(serialized.lookupIndex).map(([k, v]) => {
                const map = new Map<number, ModuleFlags>() as ModulesMap;

                map.fullLookup = v?._[ModulesMapInternal.FULL_LOOKUP] === 1;
                map.notFound = v?._[ModulesMapInternal.NOT_FOUND] === 1;

                for (const strId in v) {
                    if (strId === "_") continue;
                    map.set(Number(strId), v[strId as unknown as number]!);
                }

                return [k, map];
            }),
        ),
        save: debounce(() => {
            kvStorage.setItem(
                WINTRY_METRO_CACHE_KEY,
                JSON.stringify({
                    v: {
                        cache: CACHE_VERSION,
                        bundle: NativeClientInfoModule.Build as number,
                    },
                    moduleFlags: Object.fromEntries(cache.moduleFlags),
                    lookupIndex: Object.fromEntries(
                        [...cache.lookupIndex].map(([k, v]) => {
                            const serializedMap: SerializableModulesMap = {
                                _: [v?.fullLookup ? 1 : 0, v?.notFound ? 1 : 0],
                            };

                            for (const [id, flags] of v!) {
                                serializedMap[id] = flags;
                            }

                            return [k, serializedMap];
                        }),
                    ),
                } satisfies SerializedMetroCache),
            );
        }, 500),

        invalidate() {
            kvStorage.removeItem(WINTRY_METRO_CACHE_KEY);
            Object.assign(cache, setupMetroCache());
            cache.save();
        },
    };

    return cache;
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
        MetroCache.moduleFlags.set(moduleId, flags);
    }
}

export function isModuleBlacklisted(moduleId: number): boolean {
    return (MetroCache.moduleFlags.get(moduleId)! & ModuleFlags.BLACKLISTED) !== 0;
}

/** @internal */
export function createCacheHandler(key: string, allFind: boolean) {
    let indexObject = MetroCache.lookupIndex.get(key);

    if (!indexObject) {
        indexObject = new Map<number, ModuleFlags>() as ModulesMap;
        MetroCache.lookupIndex.set(key, indexObject);
    }

    return {
        cacheId(moduleId: number, exports: any) {
            if (!indexObject.has(moduleId)) indexObject.set(moduleId, getModuleExportFlags(exports));

            MetroCache.save();
        },
        // Finish may not be called by single/numbered find
        finish(notFound: boolean) {
            if (allFind) indexObject.fullLookup = true;
            if (notFound) indexObject.notFound = true;

            MetroCache.save();
        },
    };
}

export function* iterateModulesForCache(key: string, fullLookup: boolean): Generator<[number, any]> {
    let cache = MetroCache.lookupIndex.get(key);

    if (fullLookup && !cache?.fullLookup) cache = undefined;
    if (cache?.notFound) return;

    if (cache) {
        for (const id of cache.keys()) {
            const exports = window.__r(id);
            if (isBadModuleExports(exports)) continue;
            yield [id, exports];
        }
    }

    for (const id of moduleRegistry.keys()) {
        let exports: any;
        try {
            if (isModuleBlacklisted(id) || cache?.has(id)) continue;

            exports = window.__r(id);
        } catch {
            // noop
        }

        if (isBadModuleExports(exports)) continue;
        yield [id, exports];
    }
}

export function getAllCachedModuleIds(id: string) {
    const modulesMap = MetroCache.lookupIndex.get(id);
    if (!modulesMap) return undefined;

    return [...modulesMap.keys()];
}

export function onceCacheReady(callback: (cache: MetroCache) => void) {
    callback(MetroCache);
}
