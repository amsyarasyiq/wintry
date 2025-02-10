import type { Plugin } from "esbuild";
import path from "path";

const namespace = "lazy-resolver";

export function lazyResolverPlugin(): Plugin {
    return {
        name: namespace,
        setup(build) {
            const filter = /.*/;

            build.onResolve({ filter }, args => {
                const { lazy } = args.with ?? {};
                if (lazy !== "on") return null;

                return {
                    path: args.path,
                    namespace,
                    pluginData: {
                        importer: args.importer,
                        originalPath: args.path,
                    },
                };
            });

            build.onLoad({ filter, namespace }, async args => {
                try {
                    const { importer } = args.pluginData ?? {};
                    if (!importer) throw new Error("Missing importer in pluginData");

                    return {
                        contents: [
                            `// Lazy-loaded module: ${args.path}`,
                            `module.exports = require("@utils/lazy").createLazyImportProxy(`,
                            `  () => require(${JSON.stringify(args.path)})`,
                            ");",
                        ].join("\n"),
                        loader: "js",
                        resolveDir: path.dirname(importer),
                    };
                } catch (error) {
                    return {
                        errors: [{ text: `Failed to load lazy module: ${error.message}` }],
                    };
                }
            });
        },
    };
}
