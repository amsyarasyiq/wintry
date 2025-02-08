import swc from "@swc/core";
import { $, file, fileURLToPath } from "bun";
import crypto from "crypto";
import { build, type BuildOptions } from "esbuild";
import yargs from "yargs-parser";
import { printBuildSuccess } from "./util";
import path from "path";
import globalPlugin from "esbuild-plugin-globals";
import { makeAssetModule, makePluginContextModule, makeRequireModule } from "./modules";
import babel from "@babel/core";

const metroDeps: string[] = await (async () => {
    const ast = await swc.parseFile(path.resolve("./shims/depsModule.ts"));

    // @ts-ignore
    return ast.body.at(-1).expression.properties.map(p => p.key.value);
    // return ast.body.at(-1).expression.right.properties.map(p => p.key.value); // <- Parsing CommonJS version
})();

const args = yargs(process.argv.slice(2));
const { "release-branch": releaseBranch, "build-minify": buildMinify } = args;

let context = {} as {
    hash: string;
};

const config: BuildOptions = {
    stdin: {
        resolveDir: path.dirname(require.resolve("../src")),
        contents: `
            try {
                WINTRY_START_TIME = nativePerformanceNow();
                require("./index.ts");
            } catch (e) {
                require("./error-reporter.ts").default(e);
            }
        `,
    },
    bundle: true,
    outfile: "dist/wintry.js",
    format: "iife",
    splitting: false,
    external: [],
    supported: {
        // Hermes does not actually support const and let, even though it syntactically
        // accepts it, but it's treated just like 'var' and causes issues
        "const-and-let": false,
    },
    footer: {
        js: "//# sourceURL=wintry",
    },
    platform: "browser",
    define: {
        window: "globalThis",
        global: "globalThis",
        __DEV__: JSON.stringify(releaseBranch !== "main"),
    },
    // inject: ["./shims/asyncIteratorSymbol.js", "./shims/promiseAllSettled.js"],
    legalComments: "none",
    alias: {
        "!wintry-deps-shim!": "./shims/depsModule",
        "react/jsx-runtime": "./shims/jsxRuntime",
        "no-expose": "./shims/emptyModule",

        "react-native-customizable-toast": "./node_modules/react-native-customizable-toast/src/index.ts",
    },
    plugins: [
        globalPlugin({
            ...metroDeps.reduce((obj: Record<string, any>, key) => {
                obj[key] = `require("!wintry-deps-shim!").default[${JSON.stringify(key)}]`;
                return obj;
            }, {}),
        }),
        {
            name: "modules-exposer",
            setup(build) {
                build.onResolve({ filter: /^!wintry_global!$/ }, async args => {
                    return { path: args.path, namespace: "modules-exposer" };
                });

                build.onLoad({ filter: /.*/, namespace: "modules-exposer" }, async () => {
                    const script = await makeRequireModule();
                    return { contents: script, loader: "js", resolveDir: path.resolve(".") };
                });
            },
        },
        {
            name: "asset-loader",
            setup(build) {
                build.onResolve({ filter: /\.png$/ }, args => {
                    const fullPathToAsset = path.resolve(path.dirname(args.importer), args.path);
                    const filePath =
                        args.path[0] === "@" ? `src/${args.path.slice(1)}` : path.relative(".", fullPathToAsset);

                    return {
                        path: filePath.replaceAll(path.sep, "/"),
                        namespace: "asset-loader",
                    };
                });

                build.onLoad({ filter: /.*/, namespace: "asset-loader" }, async args => {
                    return {
                        contents: await makeAssetModule(args.path),
                        loader: "js",
                        resolveDir: path.resolve("."),
                    };
                });
            },
        },
        {
            name: "lazy-resolver",
            setup(build) {
                build.onResolve({ filter: /.*/ }, args => {
                    if (args.with.lazy === "on") {
                        return {
                            path: args.path,
                            namespace: "resolve-lazy",
                            pluginData: { importer: args.importer },
                        };
                    }

                    return null;
                });

                build.onLoad({ filter: /.*/, namespace: "resolve-lazy" }, async args => {
                    return {
                        contents: `module.exports = require("@utils/lazy").lazyObjectGetter(() => require("${args.path}"))`,
                        loader: "js",
                        resolveDir: path.dirname(args.pluginData.importer),
                    };
                });
            },
        },
        {
            name: "plugins-context",
            setup(build) {
                build.onResolve({ filter: /^#plugin-context$/ }, args => ({
                    path: `${args.path}#${args.importer}`,
                    namespace: "plugins-context",
                    pluginData: { importer: args.importer },
                }));

                build.onLoad({ filter: /.*/, namespace: "plugins-context" }, args => {
                    const { importer } = args.pluginData as { importer: string };
                    const pluginPath = fileURLToPath(import.meta.resolve("../src/plugins"));

                    // Extract plugin ID from the import path
                    const pluginId = path
                        .relative(pluginPath, importer)
                        .split(path.sep)
                        .find(segment => !segment.startsWith("_"));

                    if (!pluginId) {
                        throw new Error(`Could not determine plugin ID from path: ${importer}`);
                    }

                    return {
                        contents: makePluginContextModule(pluginId),
                        resolveDir: path.resolve("."),
                        loader: "js",
                    };
                });
            },
        },
        {
            name: "syntax-aware-loader",
            setup(build) {
                build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async args => {
                    let transformedCode = await file(args.path).text();

                    let imports: string[] | null = null;
                    try {
                        imports = new Bun.Transpiler({ loader: "tsx", autoImportJSX: true })
                            .scanImports(transformedCode)
                            .map(i => i.path);
                    } catch {
                        console.log(`Failed to parse imports for ${args.path}`);
                    }

                    const swcTransform = await swc.transformFile(args.path, {
                        jsc: {
                            externalHelpers: true,
                            // Why? Because some libraries use .js extension for ts/tsx/jsx files
                            parser: args.path.includes("node_modules")
                                ? {
                                      syntax: "typescript",
                                      tsx: true,
                                  }
                                : undefined,
                            transform: {
                                constModules: {
                                    globals: {
                                        "#build-info": {
                                            commitHash: `"${context.hash}"`,
                                            branch: `"${releaseBranch ?? "local"}"`,
                                        },
                                    },
                                },
                                react: {
                                    runtime: "automatic",
                                },
                            },
                            experimental: {
                                keepImportAssertions: true,
                            },
                        },
                        // https://github.com/facebook/hermes/blob/3815fec63d1a6667ca3195160d6e12fee6a0d8d5/doc/Features.md
                        // https://github.com/facebook/hermes/issues/696#issuecomment-1396235791
                        env: {
                            targets: "fully supports es6",
                            include: [
                                "transform-block-scoping",
                                "transform-classes",
                                "transform-async-to-generator",
                                "transform-async-generator-functions",
                            ],
                            exclude: [
                                "transform-parameters",
                                "transform-template-literals",
                                "transform-exponentiation-operator",
                                "transform-named-capturing-groups-regex",
                                "transform-nullish-coalescing-operator",
                                "transform-object-rest-spread",
                                "transform-optional-chaining",
                                "transform-logical-assignment-operators",
                            ],
                        },
                    });

                    const hasWorkletSyntax = contents => ["'worklet'", '"worklet"'].find(fn => contents.includes(fn));
                    if (imports && !imports.includes("react-native-reanimated") && !hasWorkletSyntax(transformedCode)) {
                        transformedCode = swcTransform.code;
                    } else {
                        const babelTransform = await babel.transformAsync(swcTransform.code, {
                            minified: false,
                            compact: false,
                            filename: args.path,
                            caller: {
                                name: "syntax-aware-loader",
                                supportsStaticESM: true,
                            },
                            plugins: [
                                "react-native-reanimated/plugin",
                                // Required because Reanimated plugin uses const and let
                                "@babel/plugin-transform-block-scoping",
                            ],
                            generatorOpts: {
                                importAttributesKeyword: "with",
                            },
                        });

                        transformedCode = babelTransform?.code!;
                    }

                    return { contents: transformedCode };
                });
            },
        },
    ],
};

export async function buildBundle(overrideConfig: BuildOptions = {}) {
    context = {
        hash:
            (releaseBranch && (await $`git rev-parse --short HEAD`.quiet()).text().trim()) ||
            crypto.randomBytes(8).toString("hex").slice(0, 7), // Random hash for each local build
    };

    const initialStartTime = performance.now();
    await build({ ...config, ...overrideConfig });

    return {
        config,
        context,
        timeTook: performance.now() - initialStartTime,
    };
}

if (import.meta.main) {
    const { timeTook } = await buildBundle();

    printBuildSuccess(context.hash, releaseBranch, timeTook);

    if (buildMinify) {
        const { timeTook } = await buildBundle({
            minify: true,
            outfile: config.outfile!.replace(/\.js$/, ".min.js"),
        });

        printBuildSuccess(context.hash, releaseBranch, timeTook, true);
    }
}
