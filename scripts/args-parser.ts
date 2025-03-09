import { parseArgs } from "util";

const serveScripts = ["./serve", "./adb"];
const isServeMain = serveScripts.some(s => Bun.main === Bun.resolveSync(s, import.meta.dir));

export const { values: args } = parseArgs({
    args: Bun.argv,
    options: {
        deploy: {
            short: "d",
            type: "boolean",
            default: false,
        },
        minify: {
            short: "m",
            type: "boolean",
            default: false,
        },
        port: {
            short: "p",
            type: "string",
            default: isServeMain ? "4040" : undefined,
        },
        wsa: {
            type: "boolean",
            default: false,
        },
        nocompile: {
            type: "boolean",
            default: false,
        },
    },
    strict: true,
    allowPositionals: true,
    tokens: true,
});
