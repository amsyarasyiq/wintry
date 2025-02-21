import type { Server, ServerWebSocket } from "bun";
import { args } from "../args-parser";
import { createBuildContext, type WintryBuildContext } from "../build";
import logger from "../logger";

import * as c from "ansi-colors";
import { networkInterfaces } from "os";
import * as hermesc from "hermes-compiler";
import { writeFile } from "fs/promises";

function getHostAddresses(): string[] {
    const hostAddresses: string[] = [];

    const netInterfaces = networkInterfaces() ?? [];
    for (const netinterfaces of Object.values(netInterfaces)) {
        for (const details of netinterfaces || []) {
            if (details.family !== "IPv4") continue;
            hostAddresses.push(details.address);
        }
    }

    return hostAddresses;
}

// Returns the bytecode version
function parseHbcBundlePath(path: string): number | undefined {
    const res = /^\/bundle\.(\d+)\.hbc$/.exec(path);
    if (res?.[1]) {
        return Number(res[1]);
    }
}

export function startDevelopmentServer(
    getBuildContext: () => Promise<WintryBuildContext>,
    getMinifiedBuildContext: () => Promise<WintryBuildContext>,
) {
    let lastRequest: Request;

    const server = Bun.serve({
        port: args.port,
        async fetch(request: Request, server: Server) {
            lastRequest = request;

            const { pathname } = new URL(request.url);

            const hbcVersion = parseHbcBundlePath(pathname) || Number.NaN;

            if (pathname === "/info.json") {
                const compilers = [hermesc];

                return Response.json({
                    paths: ["/bundle.js", "/bundle.min.js", ...compilers.map(v => `/bundle.${v.VERSION}.hbc`)],
                });
            }

            if (pathname === "/bundle.js" || pathname === "/bundle.min.js" || hbcVersion > 0) {
                try {
                    const buildContext =
                        pathname !== "/bundle.min.js" ? await getBuildContext() : await getMinifiedBuildContext();

                    const isFreshBuild = buildContext.lastBuildConsumed;
                    if (isFreshBuild) {
                        logger(c.yellow(`Rebuilding ${pathname}...`));
                        try {
                            await buildContext.build({ silent: true });
                        } catch (e) {
                            return new Response(`Build failed: ${e.message}`, { status: 500 });
                        }
                    }

                    buildContext.lastBuildConsumed = true;
                    let file = Bun.file(buildContext.outputPath!);

                    if (hbcVersion > 0) {
                        if (hbcVersion !== hermesc.VERSION) {
                            logger(
                                c.redBright(`Version requested is not supported: ${hbcVersion} !== ${hermesc.VERSION}`),
                            );

                            return new Response(`Unsupported version: ${hbcVersion}`, { status: 404 });
                        }

                        const startTime = performance.now();
                        const bundleBuffer = Buffer.from(await file.arrayBuffer());
                        const { bytecode } = hermesc.compile(bundleBuffer, { sourceURL: "wintry" });

                        logger(c.dim("Bundle compilation took:"), `${(performance.now() - startTime).toFixed(2)}ms`);

                        const hbcPath = file.name!.replace(/\.js$/, `.${hbcVersion}.hbc`);
                        await writeFile(hbcPath, bytecode);
                        file = Bun.file(hbcPath);
                    }

                    logger(
                        c.dim("Serving build:"),
                        "\n  ",
                        c.bold.green("File:"),
                        file.name!,
                        "\n  ",
                        c.bold.green("Status:"),
                        isFreshBuild ? "fresh-build" : "pre-built",
                        "\n  ",
                        c.bold.green("Revision:"),
                        buildContext.revision,
                        "\n  ",
                        c.bold.green("Hash:"),
                        new Bun.CryptoHasher("sha1")
                            .update(await file.arrayBuffer())
                            .digest()
                            .toString("hex"),
                        "\n  ",
                        c.bold.green("Time taken:"),
                        `${buildContext.timeTaken?.toFixed(2)}ms`,
                    );

                    return new Response(file.stream(), {
                        headers: {
                            "Content-Type": "application/javascript",
                            "Cache-Control": "no-cache",
                            ETag: buildContext.revision,
                        },
                    });
                } catch (error) {
                    console.error("Build error:", error);
                    return new Response(`Build failed: ${error.message}`, { status: 500 });
                }
            }

            return new Response(`Unknown path: ${pathname}`, { status: 404 });
        },
        websocket: {
            message: async (ws: ServerWebSocket<unknown>, message: string | Buffer) => {
                throw new Error("Function not implemented.");
            },
        },
    });

    logger(c.yellow("Serving local development server on:"));
    for (const host of getHostAddresses()) {
        logger(`  http://${host}:${c.underline.green(server.port.toString())}/`);
    }

    logger(c.dim("\nPress Ctrl+C to stop the server."));
    return {
        server,
        getLastRequest() {
            return lastRequest;
        },
    };
}

if (import.meta.main) {
    if (args.deploy) {
        logger(c.red("Cannot serve in deploy mode."));
        process.exit(1);
    }

    if (args.minify) {
        logger(c.yellowBright("Minify flag is provided, but this is a development server. Ignoring..."));
    }

    console.clear();

    let buildContext: WintryBuildContext;
    let minifiedBuildContext: WintryBuildContext;

    startDevelopmentServer(
        async () => (buildContext ??= await createBuildContext({ minify: false })),
        async () => (minifiedBuildContext ??= await createBuildContext({ minify: true })),
    );
}
