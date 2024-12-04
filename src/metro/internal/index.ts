import { setupMetroCache } from "./caches";
import { moduleRegistry, patchModule } from "./modules";

export async function initializeMetro() {
    await setupMetroCache();

    patchModule(
        state => state.module?.exports?.registerAsset,
        module => {
            const assetRegistryModuleId = module.id;

            moduleRegistry.forEach((module, id) => {
                if (Number(module.dependencies) === assetRegistryModuleId) {
                    console.log(`${id} is an asset module`);
                }
            });
        },
        { max: 2 },
    );
}
