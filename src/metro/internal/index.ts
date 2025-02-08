import { before, instead } from "@patcher";
import { MetroCache, markExportsFlags } from "./caches";
import { _importingModuleId, moduleRegistry, patchModule } from "./modules";

export function initializeMetro() {
    MetroCache.initialize();

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

    patchModule(
        exports => exports.fileFinishedImporting,
        state => {
            before(state.module.exports, "fileFinishedImporting", (args: any) => {
                if (_importingModuleId === -1 || !args[0]) return;
                moduleRegistry.get(_importingModuleId)!.meta.filePath = args[0];
            });
        },
    );

    // Essential patch for brute finding modules, so (bad) modules that aren't supposed to be initialized
    // won't make the app stop working/working oddly

    // Fix UI thread hanging
    patchModule(
        exp => exp.default?.reactProfilingEnabled,
        // The bad module is next to the module that is being checked
        ({ id }) => markExportsFlags(id + 1, undefined),
    );

    // Prevent modules that registers a moment locale from changing the current locale
    // Not tested, directly ported from Bunny's code, but it should work
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
