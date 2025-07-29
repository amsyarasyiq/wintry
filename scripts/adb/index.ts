import { $, sleep } from "bun";
import readline from "readline";
import * as c from "ansi-colors";
import { type WintryBuildContext, createBuildContext } from "../build";
import { args } from "../args-parser";
import logger from "../logger";
import { startDevelopmentServer } from "../serve";

const packageName = Bun.env.DISCORD_PACKAGE_NAME ?? "com.discord";

export async function forceStopApp(serialNumber: string) {
    await $`adb -s ${serialNumber} shell am force-stop ${packageName}`.quiet();
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

abstract class EmulatorManager {
    abstract readonly serialNumber: string;
    abstract readonly platform: "windows" | "linux";
    abstract readonly name: string;

    abstract isRunning(): Promise<boolean>;

    async waitForConnection(): Promise<void> {
        if (!await this.isRunning()) {
            logger(
                c.redBright(
                    `${this.name} is not running. Please start ${this.name} manually and try again.`
                )
            );
            process.exit(1);
        }

        const connectedDevices = await getConnectedDevices();
        if (!connectedDevices.includes(this.serialNumber)) {
            logger(c.dim(`Connecting to ${this.name}...`));

            let attempts = 0;
            const maxAttempts = 30;

            while (attempts < maxAttempts) {
                try {
                    await this.connectDevice();
                    break;
                } catch {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        logger(
                            c.redBright(
                                `Failed to connect to ${this.name} after multiple attempts.`
                            )
                        );
                        process.exit(1);
                    }
                    await sleep(1000);
                }
            }
        }
    }

    protected async connectDevice(): Promise<void> {
        const result = await $`adb connect ${this.serialNumber}`.quiet();
        if (result.text().includes("cannot connect to")) {
            throw new Error("Failed to connect to device");
        }
    }
}

class WSAManager extends EmulatorManager {
    readonly serialNumber = "127.0.0.1:58526";
    readonly platform = "windows" as const;
    readonly name = "WSA";

    async isRunning(): Promise<boolean> {
        try {
            const tasks = await $`tasklist`.text();
            return tasks.toLowerCase().includes("wsaclient.exe");
        } catch {
            return false;
        }
    }
}

class WaydroidManager extends EmulatorManager {
    // TODO: Is this always the same?
    readonly serialNumber = "192.168.240.112:5555";
    readonly platform = "linux" as const;
    readonly name = "Waydroid";

    async isRunning(): Promise<boolean> {
        try {
            const result = await $`waydroid status`.nothrow().quiet();
            return result.exitCode === 0 && result.text().includes("RUNNING");
        } catch {
            return false;
        }
    }
}

function createEmulatorManager(): EmulatorManager {
    const isWindows = process.platform === "win32";
    const isLinux = process.platform === "linux";

    if (args.wsa) {
        if (!isWindows) {
            logger(c.yellowBright("Warning: WSA flag is provided but you're not on Windows. This may not work as expected."));
        }
        return new WSAManager();
    }

    if (args.waydroid) {
        if (!isLinux) {
            logger(c.yellowBright("Warning: Waydroid flag is provided but you're not on Linux. This may not work as expected."));
        }
        return new WaydroidManager();
    }
    
    logger(c.redBright("Unsupported emulator. Only --wsa or --waydroid supported."));
    process.exit(1);
}

if (import.meta.main) {
    if (args.deploy) {
        logger(c.red("Cannot serve in deploy mode."));
        process.exit(1);
    }

    if (args.minify) {
        logger(c.yellowBright("Minify flag is provided, but this is a development server. Ignoring..."));
    }

    // Check if adb is installed
    if ((await $`adb version`.nothrow().quiet()).exitCode !== 0) {
        logger(c.redBright("ADB is not installed or not found in PATH. Please install ADB and try again."));
        process.exit(1);
    }

    logger.clear();

    const connectedDevices = await getConnectedDevices();
    let serialNumber: string = connectedDevices[0];
    let emulatorManager: EmulatorManager | null = null;

    if (args.wsa || args.waydroid) {
        emulatorManager = createEmulatorManager();
        await emulatorManager.waitForConnection();
        serialNumber = emulatorManager.serialNumber;
    } else {
        if (connectedDevices.length === 0) {
            logger(c.redBright("No devices connected. Please connect a device and try again."));
            process.exit(1);
        }

        if (connectedDevices.length > 1) {
            logger("Multiple devices found. Please choose a device:");
            connectedDevices.forEach((device, index) => {
                logger(`${index + 1}: ${device}`);
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
    }

    logger(c.dim(`Waiting for device: ${serialNumber}`));
    await $`adb -s ${serialNumber} wait-for-device`.quiet();

    let buildContext: WintryBuildContext;
    let minifiedBuildContext: WintryBuildContext;

    const { server, getLastRequest } = startDevelopmentServer(
        async () => (buildContext ??= await createBuildContext({ minify: false })),
        async () => (minifiedBuildContext ??= await createBuildContext({ minify: true })),
    );

    logger(`Press R key to rebuild and reload Discord ${c.blue.bold(`(${packageName})`)}.`);
    logger(`Press S key to force stop Discord ${c.blue.bold(`(${packageName})`)}.`);

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
                    server.port!,
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
