import { before, instead } from "@patcher";
import { markExportsFlags } from "./caches";
import { _importingModuleId, internal_onModuleLoaded, moduleRegistry } from "./registry";
import type { ModuleState } from "@metro/types";
import { isBadModuleExports } from "./modules";

/**
 * Very similar to `waitFor`, but much simpler.
 * @internal
 */
function patchModule(
    predicate: (module: any, state: ModuleState) => boolean,
    patch: (state: ModuleState) => void,
    { count = 1 } = {},
) {
    let _count = 0;

    const callback = (state: ModuleState) => {
        const exports = state.module.exports;
        if (exports && !isBadModuleExports(exports) && predicate(exports, state)) {
            patch(state);
            if (++_count === count) {
                internal_onModuleLoaded.delete(callback);
            }
        }
    };

    internal_onModuleLoaded.add(callback);
}

export function initializeMetro() {
    // Patches required for extra metadata of the modules
    patchModule(
        exports => exports.registerAsset,
        state => {
            const assetRegistryModuleId = state.id;

            for (const state of moduleRegistry.values()) {
                if (Number(state.dependencies) === assetRegistryModuleId) {
                    state.meta.isAsset = true;
                }
            }
        },
        { count: 2 },
    );

    patchModule(
        exports => exports.fileFinishedImporting,
        state => {
            before(state.module.exports, "fileFinishedImporting", (args: any) => {
                if (_importingModuleId === -1 || !args[0]) return;
                moduleRegistry.get(_importingModuleId)!.meta.filePath = args[0];
            });
        },
    );

    // Patch required to transform our custom assets to be renderable by React Native
    patchModule(
        exports => exports.name === "resolveAssetSource",
        ({ module: { exports: resolveAssetSource } }) => {
            type WintryAsset = {
                __wintry: boolean;
                width: number;
                height: number;
                dataurl: string;
            };

            // Transform the asset from a data URL
            resolveAssetSource.addCustomSourceTransformer(({ asset }: { asset: WintryAsset }) => {
                if (asset.__wintry) {
                    return {
                        __packager_asset: true,
                        width: asset.width,
                        height: asset.height,
                        uri: asset.dataurl,
                        scale: 1,
                    };
                }
            });
        },
    );

    // Essential patch for brute finding modules, so (bad) modules that aren't supposed to be initialized
    // won't make the app stop working/working oddly

    // Fix UI thread hanging on Android. This patch is flawed and considered hacky since there are
    // multiple modules that matches the filter. patchModule is also lazy, but we can ignore that for now
    // since this happens while brute finding modules and imports are required in order (the module we want is the first one)
    patchModule(
        exp => exp.default?.reactProfilingEnabled,
        // The bad module is next to the module that is being checked
        ({ id }) => markExportsFlags(id + 1, undefined),
    );

    // Prevent modules that registers a moment locale from changing the current locale
    patchModule(
        exp => exp.isMoment,
        ({ module: { exports } }) => {
            instead(exports, "defineLocale", (args, orig) => {
                const origLocale = exports.locale();
                orig(...args);
                exports.locale(origLocale);
            });
        },
    );
}
