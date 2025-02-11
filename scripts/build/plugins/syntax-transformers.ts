import { transformAsync } from "@babel/core";
import { transformFile } from "@swc/core";
import type { Plugin } from "esbuild";
import type { FileHandle } from "fs/promises";
import { open } from "fs/promises";

const bunTranspiler = new Bun.Transpiler({ loader: "tsx", autoImportJSX: true });

interface TransformCacheEntry {
    code: string;
    mtimeMs: number;
}

export interface FileTransformer {
    shouldTransform(contents: string): boolean;
    transform(args: { path: string }, contents: string): Promise<string>;
}

class SwcTransformer implements FileTransformer {
    shouldTransform() {
        return true; // Always run SWC first
    }
    async transform(args: { path: string }) {
        const result = await transformFile(args.path, {
            sourceMaps: false,
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
                    react: {
                        runtime: "automatic", // utilises 'react/jsx-runtime' that we modified
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
                    // Hermes does support async/await, but not for arrow functions
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

        return result.code;
    }
}

class ReanimatedTransformer implements FileTransformer {
    // https://github.com/software-mansion/react-native-reanimated/blob/b703185e9f3ea3dfd5247477177820795c6f23ec/packages/react-native-reanimated/plugin/src/autoworkletization.ts#L24C1-L46C4
    static reanimatedHooks = [
        "useAnimatedGestureHandler",
        "useAnimatedScrollHandler",

        "useFrameCallback",
        "useAnimatedStyle",
        "useAnimatedProps",
        "createAnimatedPropAdapter",
        "useDerivedValue",
        "useAnimatedScrollHandler",
        "useAnimatedReaction",
        "useWorkletCallback",

        // animations' callbacks
        "withTiming",
        "withSpring",
        "withDecay",
        "withRepeat",

        // scheduling functions
        "runOnUI",
        "executeOnUIRuntimeSync",
    ];

    static workletDirectives = ["'worklet'", '"worklet"'];

    shouldTransform(contents: string) {
        const hasWorkletDirective = ReanimatedTransformer.workletDirectives.some(directive =>
            contents.includes(directive),
        );

        if (hasWorkletDirective) return true;

        let imports: string[];
        try {
            imports = bunTranspiler.scanImports(contents).map(i => i.path);
        } catch {
            return true; // Fallback: assume Reanimated syntax on parse error
        }

        const hasReanimatedImport = imports.includes("react-native-reanimated");
        const hasReanimatedHook = ReanimatedTransformer.reanimatedHooks.some(hook => contents.includes(hook));

        return hasReanimatedImport && hasReanimatedHook;
    }
    async transform(args: { path: string }, contents: string) {
        const result = await transformAsync(contents, {
            minified: false,
            compact: false,
            filename: args.path,
            caller: {
                name: "plugin-transformers",
                supportsStaticESM: true,
            },
            plugins: [
                "react-native-reanimated/plugin",
                // Required because Reanimated plugin adds const and let
                "@babel/plugin-transform-block-scoping",
            ],
            generatorOpts: {
                importAttributesKeyword: "with",
            },
        });

        return result?.code!;
    }
}

export interface SyntaxTransformerOptions {
    /**
     * Enable/disable caching of transformed files.
     * @default true
     * */
    cache?: boolean;
    /** List of custom transformers to use */
    customTransformers?: FileTransformer[];
}

export function syntaxTransformersPlugin(options: SyntaxTransformerOptions = {}): Plugin {
    return {
        name: "syntax-transformers",
        setup(build) {
            const transformCache = options.cache !== false ? new Map<string, TransformCacheEntry>() : null;
            const transformers = [
                new SwcTransformer(),
                new ReanimatedTransformer(),
                ...(options.customTransformers || []),
            ];

            build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async args => {
                let handle: FileHandle = null!;
                try {
                    handle = await open(args.path, "r");
                    const stats = await handle.stat();

                    if (transformCache) {
                        const entry = transformCache.get(args.path);
                        if (entry && entry.mtimeMs === stats.mtimeMs) {
                            return { contents: entry.code, loader: "js" };
                        }
                    }

                    let contents = await handle.readFile("utf8");

                    for (const transformer of transformers) {
                        if (transformer.shouldTransform(contents)) {
                            contents = await transformer.transform(args, contents);
                        }
                    }

                    if (transformCache) {
                        transformCache.set(args.path, {
                            code: contents,
                            mtimeMs: stats.mtimeMs,
                        });
                    }

                    return { contents, loader: "js" };
                } finally {
                    handle?.close();
                }
            });
        },
    };
}
