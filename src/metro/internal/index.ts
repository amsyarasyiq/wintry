import { before } from "../../patcher";
import { markExportsFlags, setupMetroCache } from "./caches";
import { _importingModuleId, moduleRegistry, patchModule } from "./modules";

export function initializeMetro() {
    setupMetroCache();

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

    // Essential patch for brute finding modules, so (bad) modules that aren't supposed to be initialized
    // won't make the app stop working

    // Fix UI thread hanging
    patchModule(
        exp => exp.default?.reactProfilingEnabled,
        // The bad module is next to the module that is being checked
        ({ id }) => markExportsFlags(id + 1, undefined),
    );
}
