import type { Plugin } from "esbuild";
import { rootSrcFile } from "./common";
import { readdir } from "fs/promises";
import { stat } from "fs/promises";
import { basename } from "path";

const pluginsDirectoryPath = `${rootSrcFile}/plugins`;

async function gatherPlugins(plugins: [string, string][] = [], dir = pluginsDirectoryPath) {
    const pluginDirs = await readdir(dir, { recursive: false });

    for (const pluginDir of pluginDirs) {
        const pluginPath = `${dir}/${pluginDir}`;
        const stats = await stat(pluginPath);

        if (stats.isDirectory()) {
            if (basename(pluginDir).startsWith("_")) {
                await gatherPlugins(plugins, pluginPath);
            } else {
                plugins.push([pluginDir, pluginPath.replace(pluginsDirectoryPath, "")]);
            }
        }
    }

    return plugins;
}

async function makeModule() {
    const plugins = await gatherPlugins();

    const pluginImports = plugins.map(([plugin, relativePath]) => {
        return `"${plugin}": require("./plugins/${relativePath}").default(${JSON.stringify(relativePath)})`;
    });

    return `
        export default {
            ${pluginImports.join(",\n")}
        }
    `;
}

export function pluginsImporterPlugin(): Plugin {
    return {
        name: "plugins-importer",
        setup(build) {
            build.onResolve({ filter: /^#wt-plugins$/ }, args => {
                const pluginsPath = `${rootSrcFile}/plugins`;
                return {
                    path: pluginsPath,
                    namespace: "plugins-importer",
                };
            });

            build.onLoad({ filter: /.*/, namespace: "plugins-importer" }, async () => {
                return {
                    contents: await makeModule(),
                    loader: "ts",
                    resolveDir: rootSrcFile,
                };
            });
        },
    };
}
