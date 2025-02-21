import type { Server, ServerWebSocket } from "bun";
import { args } from "../args-parser";
import { createBuildContext, type WintryBuildContext } from "../build";
import logger from "../logger";

import * as c from "ansi-colors";
import { networkInterfaces } from "os";

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
            if (pathname === "/bundle.js" || pathname === "/bundle.min.js") {
                const buildContext =
                    pathname === "/bundle.js" ? await getBuildContext() : await getMinifiedBuildContext();

                try {
                    const isFreshBuild = buildContext.lastBuildConsumed;
                    if (isFreshBuild) {
                        logger(c.yellow(`Rebuilding ${pathname}...`));
                        const response = await buildContext.build({ silent: true });
                        if (response && !response.ok) return response;
                    }

                    buildContext.lastBuildConsumed = true;
                    const file = Bun.file(buildContext.outputPath!);

                    logger(
                        c.dim("Serving build:"),
                        "\n  ",
                        c.bold.green("File:"),
                        buildContext.outputPath!,
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

            return new Response("Not found", { status: 404 });
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

    console.clear();

    let buildContext: WintryBuildContext;
    let minifiedBuildContext: WintryBuildContext;

    startDevelopmentServer(
        async () => (buildContext ??= await createBuildContext()),
        async () => (minifiedBuildContext ??= await createBuildContext({ ...args, minify: true })),
    );
}
