import { fileURLToPath, Glob } from "bun";
import { readFile, exists } from "node:fs/promises";
import path from "node:path";

async function gatherExportedModules() {
    const glob = new Glob("src/!{i18n,plugins}/**/*.{ts,tsx}");
    const files = [...glob.scanSync()];

    const transpiler = new Bun.Transpiler({
        loader: 'tsx',
    });

    const exports = {} as Record<string, string[]>;

    for (const file of files) {
        const parentDir = path.dirname(file);
        const result = transpiler.scan((await readFile(file)).toString());

        if (result.exports.length > 0
            && !result.imports.some(i => i.kind === "import-statement" && i.path === "no-expose")
            // TODO: Make this works recursively
            && !await exists(path.join(parentDir, ".no-expose"))) {
            const relativeName = path
                .relative("src", file)
                .replace(/\.tsx?$/, "")
                .replaceAll(path.sep, path.posix.sep)
                .replace(/\/index$/, "");
            exports[relativeName] = result.exports;
        }
    }
    return exports;
}

export async function makeRequireModule(): Promise<string> {
    const exports = await gatherExportedModules();
    const modules = Object.keys(exports);
    let script = `
    // Wrap modules in a proxy to allow lazy loading
    function wrap(factory) {
        var cache = null;

        return new Proxy({}, {
            get: (_, p) => (cache ??= factory())[p],
            getPrototypeOf: () => cache ??= factory(),
        });
    }

    export default {
`;

    for (const module of modules) {
        script += `    ${JSON.stringify(module)}: wrap(() => require(${JSON.stringify(`./src/${module}`)})),\n`;
    }

    script += "}\n";

    return script;
}

export function makePluginContextModule(id: string): string {
    const sharedModulePath = fileURLToPath(import.meta.resolve("../src/plugins/shared.ts"));
    const relativePath = `./${path.relative(".", sharedModulePath).replace(/\\/g, "/")}`;

    return `
        import { getPluginContext } from "${relativePath}";    
        var context = getPluginContext(${JSON.stringify(id)});

        export var { meta } = context;
        export default context;
    `;
}
