import type { BuildOptions } from "esbuild";
import path from "path";
import globalsPlugin from "esbuild-plugin-globals";
import { moduleExposerPlugin } from "./plugins/modules-exposer";
import { assetLoaderPlugin } from "./plugins/asset-loader";
import { pluginsContextProviderPlugin } from "./plugins/plugins-context";
import { syntaxTransformersPlugin } from "./plugins/syntax-transformers";
import { getDependenciesMap } from "./utils/dependencies";
import { lazyResolverPlugin } from "./plugins/lazy-resolver";
import { buildInfoPlugin } from "./plugins/build-info";
import { pluginsImporterPlugin } from "./plugins/plugins-importer";

export async function getEsbuildConfig({ deploy = false, minify = false }): Promise<BuildOptions> {
    const deps = await getDependenciesMap();

    return {
        stdin: {
            resolveDir: path.dirname(require.resolve("../../src")),
            contents: `
                try {
                    require("./entry.ts");
                } catch (e) {
                    require("./error-reporter.ts").default(e);
                }
            `,
        },
        minify,
        keepNames: true,
        bundle: true,
        outfile: minify ? "dist/bundle.min.js" : "dist/bundle.js",
        format: "iife",
        splitting: false,
        supported: {
            // 'const' and 'let' declarations are not fully supported in Hermes and
            // are treated as 'var', which can lead to unexpected behavior
            "const-and-let": false,
        },
        banner: {
            js: ["var WINTRY_START_TIME = nativePerformanceNow();", "var window = this;"].join(" "),
        },
        footer: {
            js: "//# sourceURL=wintry",
        },
        platform: "browser",
        define: {
            global: "globalThis",
            __DEV__: JSON.stringify(!deploy),
        },
        metafile: true,
        legalComments: "none",
        alias: {
            "#metro-deps#": "./shims/depsModule",
            "react/jsx-runtime": "./shims/jsxRuntime",
            "no-expose": "./shims/emptyModule",
        },
        plugins: [
            globalsPlugin(
                deps.reduce<Record<string, any>>((obj, key) => {
                    obj[key] = `require("#metro-deps#").default[${JSON.stringify(key)}]`;
                    return obj;
                }, {}),
            ),
            buildInfoPlugin(),
            moduleExposerPlugin({ excludedFolders: ["i18n", "plugins"] }),
            assetLoaderPlugin({ extensions: ["png", "jpg", "jpeg", "gif"] }),
            lazyResolverPlugin(),
            pluginsContextProviderPlugin({
                contextModule: "#plugin-context",
            }),
            pluginsImporterPlugin(),
            syntaxTransformersPlugin(),
        ],
    };
}
