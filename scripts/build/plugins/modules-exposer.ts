import { Glob } from "bun";
import type { Plugin } from "esbuild";
import { existsSync } from "fs";
import path from "path";

const namespace = "modules-exposer";
const filter = /^#globals#$/;

async function shouldExposeFile(file: string, exports: string[]): Promise<boolean> {
    if (exports.length === 0 || hasNoExposeImport(exports)) {
        return false;
    }

    let currentDir = path.dirname(file);
    const rootDir = path.resolve("src");

    while (currentDir.length >= rootDir.length) {
        if (existsSync(path.join(currentDir, ".no-expose"))) {
            return false;
        }
        currentDir = path.dirname(currentDir);
    }

    return true;
}

function hasNoExposeImport(imports: any[]): boolean {
    return imports.some(i => i.kind === "import-statement" && i.path === "no-expose");
}

function getNormalizedPath(file: string): string {
    return path
        .relative("src", file)
        .replaceAll(path.sep, path.posix.sep)
        .replace(/(?:index)?\.tsx?$/, "");
}

async function gatherExportedModules({
    excludedFolders,
}: {
    excludedFolders: string[];
}): Promise<Record<string, string[]>> {
    const glob = new Glob(`src/!{${excludedFolders.join(",")}}/**/*.{ts,tsx}`);

    const transpiler = new Bun.Transpiler({ loader: "tsx" });
    const exports: Record<string, string[]> = {};

    for await (const file of glob.scanSync()) {
        const content = await Bun.file(file).text();
        const result = transpiler.scan(content);

        if (await shouldExposeFile(file, result.exports)) {
            const relativeName = getNormalizedPath(file);
            exports[relativeName] = result.exports;
        }
    }

    return exports;
}

async function generateModuleScript({
    excludedFolders,
}: {
    excludedFolders: string[];
}): Promise<string> {
    const exports = await gatherExportedModules({ excludedFolders });
    const modules = Object.keys(exports);

    const wrapperFunction = String(function createModuleProxy(factory: () => any) {
        // biome-ignore lint/style/noVar: Hermes doesn't support 'let' or 'const' declarations
        var cache = null;

        return new Proxy(
            {},
            {
                get: (_, p) => (cache ??= factory())[p],
                getPrototypeOf: () => (cache ??= factory()),
                ownKeys: () => Reflect.ownKeys((cache ??= factory())),
                getOwnPropertyDescriptor: (_, p) => {
                    // biome-ignore lint/style/noVar: Hermes doesn't support 'let' or 'const' declarations
                    var descriptor = Reflect.getOwnPropertyDescriptor((cache ??= factory()), p);
                    if (descriptor) {
                        descriptor.configurable = true;
                    }
                    return descriptor;
                },
            },
        );
    });

    const moduleExports = modules
        .map(
            module =>
                `${JSON.stringify(module)}: createModuleProxy(() => require(${JSON.stringify(`./src/${module}`)}))`,
        )
        .join(", \n");

    return `${wrapperFunction}\n export default { ${moduleExports} }`;
}

export function moduleExposerPlugin({
    excludedFolders,
}: {
    excludedFolders: string[];
}): Plugin {
    return {
        name: namespace,
        setup(build) {
            build.onResolve({ filter }, async args => {
                return { path: args.path, namespace };
            });

            build.onLoad({ filter, namespace }, async () => {
                const script = await generateModuleScript({ excludedFolders });
                return { contents: script, loader: "ts", resolveDir: path.resolve(".") };
            });
        },
    };
}
