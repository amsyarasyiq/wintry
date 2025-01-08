import yargsParser from "yargs-parser";
import { buildBundle } from "./build";
import { printBuildSuccess } from "./util";
import readline from "readline";
import chalk from "chalk";
import { isADBAvailableAndAppInstalled, getPackageName, restartAppFromADB, forceStopAppFromADB } from "./adb";

const args = yargsParser(Bun.argv.slice(2));

export const serveDev = () =>
    Bun.serve({
        port: 4040,
        async fetch(req, server) {
            const url = new URL(req.url);

            console.log(`Request: ${url.pathname}`);

            if (url.pathname === "/debug" && server.upgrade(req)) {
                return;
            }

            if (url.pathname === "/bundle.js") {
                try {
                    const { config, context, timeTook } = await buildBundle();

                    printBuildSuccess(context.hash, "local", timeTook);

                    return new Response(await Bun.file(config.outfile!).arrayBuffer(), {
                        headers: { "Content-Type": "application/javascript" },
                    });
                } catch {
                    return new Response(null, { status: 500 });
                }
            }

            return new Response("Unknown request", { status: 404 });
        },
        websocket: {
            message(ws, message) {
                ws.send("Message received!");
            },
            open(ws) {
                console.log("WebSocket connected!");
                ws.send("Connected!");
            },
            close(ws, code, message) {},
            drain(ws) {},
        }, // handlers
    });

if (import.meta.main) {
    const server = serveDev();

    console.log("\nPress Q key or Ctrl+C to exit.");

    if (args.adb && (await isADBAvailableAndAppInstalled())) {
        const packageName = getPackageName();

        console.log(`Press R key to reload Discord ${chalk.bold.blue(`(${packageName})`)}.`);
        console.log(`Press S key to force stop Discord ${chalk.bold.blue(`(${packageName})`)}.`);

        readline.emitKeypressEvents(process.stdin);

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        process.stdin.on("keypress", (ch, key) => {
            if (!key) return;

            if (key.name === "q" || (key.ctrl && key.name === "c")) {
                process.exit(0);
            }

            if (key.name === "r") {
                console.info(chalk.yellow(`${chalk.bold("↻ Reloading")} ${packageName}`));
                restartAppFromADB(server.port)
                    .then(() => console.info(chalk.greenBright(`${chalk.bold("✔ Executed")} reload command`)))
                    .catch(e => console.error(e));
            }

            if (key.name === "s") {
                console.info(chalk.yellow(`${chalk.bold("⎊ Force stopping")} ${packageName}`));
                forceStopAppFromADB()
                    .then(() => console.info(chalk.greenBright(`${chalk.bold("✔ Executed")} force stop command`)))
                    .catch(e => console.error(e));
            }
        });
    } else if (args.adb) {
        console.warn("ADB option enabled but failed to connect to device!");
    }
}
