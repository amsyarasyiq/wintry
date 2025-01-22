export function getPluginContext(id: string) {
    // If you added more properties to the context (first level), make sure to update
    // the type definition in src/modules.d.ts and named export in scripts/modules.ts
    return {
        meta: {
            id,
        }
    }
}