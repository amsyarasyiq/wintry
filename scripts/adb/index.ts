import { $, sleep } from "bun";
import readline from "readline";
import * as c from "ansi-colors";
import { type WintryBuildContext, createBuildContext } from "../build";
import { args } from "../args-parser";
import logger from "../logger";
import { startDevelopmentServer } from "../serve";
import { exec } from "child_process";

const packageName = Bun.env.DISCORD_PACKAGE_NAME ?? "com.discord";
const WSA_SERIAL_NUMBER = "127.0.0.1:58526";

export async function forceStopApp(serialNumber: string) {
    await $`adb -s ${serialNumber} shell am force-stop ${packageName}`.quiet();
}

export async function isWsaRunning() {
    const tasks = await $`tasklist`.text();
    return tasks.toLowerCase().includes("wsaclient.exe");
}

export async function getConnectedDevices() {
    const devices = await $`adb devices -l`.text();
    const lines = devices.split("\n");

    const unwantedLines = ["List of devices attached", "daemon not running", "daemon started"];

    return lines
        .filter(line => line.trim())
        .filter(line => !unwantedLines.some(unwanted => line.includes(unwanted)))
        .filter(line => line.includes(" device"))
        .map(line => line.split(/\s+/)[0]);
}

if (import.meta.main) {
    if (args.deploy) {
        logger(c.red("Cannot serve in deploy mode."));
        process.exit(1);
    }

    console.clear();

    const connectedDevices = await getConnectedDevices();
    let serialNumber: string = connectedDevices[0];

    if (!args.wsa && connectedDevices.length === 0) {
        logger(c.redBright("No devices connected. Please connect a device and try again."));
        process.exit(1);
    }

    if (!args.wsa && connectedDevices.length > 1) {
        console.log("Multiple devices found. Please choose a device:");
        connectedDevices.forEach((device, index) => {
            console.log(`${index + 1}: ${device}`);
        });

        const answer = prompt("Enter device number: ");

        const deviceIndex = Number(answer) - 1;
        if (Number.isNaN(deviceIndex) || deviceIndex < 0 || deviceIndex >= connectedDevices.length) {
            logger(c.redBright("Invalid device selection"));
            process.exit(1);
        }

        serialNumber = connectedDevices[deviceIndex];
        logger(c.dim(`Selected device: ${serialNumber}`));
    }

    if (args.wsa) {
        if (connectedDevices.length > 1) {
            logger(c.yellowBright("Multiple devices found. Using WSA client for connection."));
        }

        if (!connectedDevices.includes(WSA_SERIAL_NUMBER)) {
            if (!(await isWsaRunning())) {
                logger(c.redBright("WSA client is not running. Attempting to launch..."));
                exec(`start wsa://${packageName}`);
            }

            logger(c.dim("Waiting for WSA client to start for ADB connection"));
            while (true) {
                if (!(await isWsaRunning())) {
                    await sleep(1000);
                    continue;
                }

                const result = await $`adb connect ${WSA_SERIAL_NUMBER}`.quiet();

                if (result.text().includes("cannot connect to")) {
                    await sleep(1000);
                    continue;
                }

                break;
            }
        }

        serialNumber = WSA_SERIAL_NUMBER;
    }

    logger(c.dim(`Waiting for device: ${serialNumber}`));
    await $`adb -s ${serialNumber} wait-for-device`.quiet();

    let buildContext: WintryBuildContext;
    let minifiedBuildContext: WintryBuildContext;

    const { server, getLastRequest } = startDevelopmentServer(
        async () => (buildContext ??= await createBuildContext()),
        async () => (minifiedBuildContext ??= await createBuildContext({ ...args, minify: true })),
    );

    console.log(`Press R key to rebuild and reload Discord ${c.blue.bold(`(${packageName})`)}.`);
    console.log(`Press S key to force stop Discord ${c.blue.bold(`(${packageName})`)}.`);

    readline.emitKeypressEvents(process.stdin);

    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }

    process.stdin.on("keypress", (ch, key) => {
        if (!key) return;

        switch (key.name) {
            case "q":
                if (!key.ctrl) process.exit(0);
                break;
            case "c":
                if (key.ctrl) process.exit(0);
                break;
            case "r":
                handleRebuild(
                    serialNumber,
                    getLastRequest()
                        ? new URL(getLastRequest().url).pathname === "/bundle.min.js"
                            ? minifiedBuildContext
                            : buildContext
                        : buildContext,
                    server.port,
                );
                break;
            case "s":
                handleForceStop(serialNumber);
                break;
        }
    });
}

async function handleRebuild(serialNumber: string, buildContext: WintryBuildContext, port: number) {
    if (buildContext) {
        await buildContext.build({ silent: false });

        logger(c.yellowBright(`Reloading Discord ${c.blue.bold(`(${packageName})`)}`));
        if (typeof port === "number") {
            await $`adb -s ${serialNumber} reverse tcp:${port} tcp:${port}`.quiet();
        }
    } else {
        logger(c.yellowBright("Build context not created, skipping rebuild and proceeding to restart app."));
    }

    await forceStopApp(serialNumber);
    await $`adb -s ${serialNumber} shell am start ${packageName}/com.discord.main.MainActivity`.quiet();
}

async function handleForceStop(serialNumber: string) {
    logger(c.yellowBright(`Force stopping Discord ${c.blue.bold(`(${packageName})`)}`));
    await forceStopApp(serialNumber);
}
