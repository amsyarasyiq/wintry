import type { Plugin } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const namespace = "plugins-context-provider";

function generatePluginContextScript(id: string): string {
    const sharedModulePath = fileURLToPath(import.meta.resolve("../../../src/plugins/shared.ts"));
    const relativePath = `./${path.relative(".", sharedModulePath).replace(/\\/g, "/")}`;

    return `
        import { getPluginContext } from "${relativePath}";    
        var context = getPluginContext(${JSON.stringify(id)});

        export var { meta, definePlugin, definePluginSettings, logger, patcher } = context;
        export default context;
    `;
}

interface PluginContextProviderOptions {
    /** Module name to match for context provider */
    contextModule?: string;

    /** Custom plugin ID extractor function */
    extractPluginId?: (importPath: string, pluginPath: string) => string;
}

export function pluginsContextProviderPlugin(options: PluginContextProviderOptions = {}): Plugin {
    return {
        name: namespace,
        setup(build) {
            build.onResolve({ filter: new RegExp(`^${options.contextModule}$`) }, args => ({
                namespace,
                path: `${args.path}#${path.relative(".", args.importer)}`,
                pluginData: { importer: args.importer },
            }));

            build.onLoad({ filter: /.*/, namespace }, args => {
                const { importer } = args.pluginData as { importer: string };
                const pluginPath = fileURLToPath(import.meta.resolve("../../../src/plugins"));

                // Extract plugin ID using custom function or default logic
                const pluginId = options.extractPluginId
                    ? options.extractPluginId(importer, pluginPath)
                    : path
                          .relative(pluginPath, importer)
                          .split(path.sep)
                          .find(segment => !segment.startsWith("_"));

                if (!pluginId) {
                    throw new Error(`Could not determine plugin ID from path: ${importer}`);
                }

                return {
                    contents: generatePluginContextScript(pluginId),
                    resolveDir: path.resolve("."),
                    loader: "js",
                };
            });
        },
    };
}
