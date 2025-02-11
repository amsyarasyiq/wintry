import type { Server, ServerWebSocket } from "bun";
import { args } from "../args-parser";
import { type WintryBuildContext, getBuildContext } from "../build";
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

export function startDevelopmentServer(buildContext: WintryBuildContext) {
    const server = Bun.serve({
        port: args.port,
        async fetch(request: Request, server: Server) {
            const { pathname } = new URL(request.url);
            if (pathname === "/bundle.js") {
                try {
                    const isFreshBuild = buildContext.lastBuildConsumed;
                    if (isFreshBuild) {
                        logger(c.yellow("Rebuilding bundle..."));
                        const response = await buildContext.build({ silent: true });
                        if (response && !response.ok) return response;
                    }

                    buildContext.lastBuildConsumed = true;
                    const file = Bun.file(buildContext.outputPath!);
                    const revision =
                        (args.deploy && buildContext.revision) ||
                        new Bun.CryptoHasher("sha1")
                            .update(await file.arrayBuffer())
                            .digest()
                            .toString("hex");

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
                        revision,
                        "\n  ",
                        c.bold.green("Time taken:"),
                        `${buildContext.timeTaken?.toFixed(2)}ms`,
                    );

                    return new Response(file, {
                        headers: {
                            "Content-Type": "application/javascript",
                            "Cache-Control": "no-cache",
                            ETag: revision,
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
    return server;
}

if (import.meta.main) {
    if (args.deploy) {
        logger(c.red("Cannot serve in deploy mode."));
        process.exit(1);
    }

    console.clear();

    const buildContext = await getBuildContext();
    startDevelopmentServer(buildContext);
}
