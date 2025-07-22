// Special thanks to https://github.com/revenge-mod/revenge-bundle-next/blob/ab8e2a577243f6de3bdb1d91c5780afc5e4fac94/scripts/build.ts#L233-L270
import type { BunFile } from "bun";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";

interface HermescOptions {
    flags?: string[];
}

function getHermescBinaryPath(): string {
    const paths = {
        win32: "win64-bin/hermesc.exe",
        darwin: "osx-bin/hermesc",
        linux: "linux64-bin/hermesc",
    } as Record<NodeJS.Platform, string>;

    if (!(process.platform in paths)) {
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    const sdksDir = "./node_modules/react-native/sdks";
    const binPath = `${sdksDir}/hermesc/${paths[process.platform]}`;

    if (!existsSync(binPath)) {
        throw new Error(`Hermes compiler not found at ${binPath}. Please ensure you have react-native installed.`);
    }

    return binPath;
}

export async function compileWithHermesc(
    inputFile: BunFile,
    outputPath: string,
    options: HermescOptions = {},
): Promise<void> {
    const { flags = [] } = options;

    const binPath = getHermescBinaryPath();

    try {
        const proc = Bun.spawnSync({
            cmd: [binPath, "-emit-binary", ...flags],
            stdin: inputFile,
            stdout: "pipe",
            stderr: "pipe",
        });

        if (proc.stdout.byteLength === 0) {
            throw new Error("No output from hermesc. Probably a compilation error.");
        }

        await writeFile(outputPath, proc.stdout);
    } catch (error) {
        throw new Error(`Got error from hermesc: ${error}`);
    }
}

export async function getHermesVersion(): Promise<string> {
    const sdksDir = "./node_modules/react-native/sdks";
    const versionFile = `${sdksDir}/.hermesversion`;

    if (!existsSync(versionFile)) {
        throw new Error(`Hermes version file not found at ${versionFile}`);
    }

    // Example: hermes-2024-11-12-RNv0.76.2-5b4aa20c719830dcf5684832b89a6edb95ac3d64
    return (await Bun.file(versionFile).text()).trim();
}

export async function getHermesBytecodeVersion(): Promise<number> {
    const binPath = getHermescBinaryPath();

    try {
        // Try to get bytecode version from hermesc
        const cmd = await Bun.$`${binPath} -version`.quiet();
        const output = cmd.stdout.toString();

        // Look for "HBC bytecode version: 96" pattern
        const bytecodeVersionMatch = output.match(/HBC\s+bytecode\s+version[:\s]+(\d+)/i);
        if (bytecodeVersionMatch) {
            return Number.parseInt(bytecodeVersionMatch[1], 10);
        }

        throw new Error(`Could not determine bytecode version from hermesc output:\n${output}`);
    } catch (error) {
        throw new Error(`Failed to get hermesc version: ${error}`);
    }
}
