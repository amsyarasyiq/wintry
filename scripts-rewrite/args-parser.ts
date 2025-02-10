import { parseArgs } from "util";

const isServeMain = Bun.main === Bun.resolveSync("./serve", import.meta.dir);

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
    },
    strict: true,
    allowPositionals: true,
    tokens: true,
});
