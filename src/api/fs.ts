import { NativeFileModule } from "@native";

/**
 * Removes all files in a directory from the path given
 * @param path Path to the targeted directory
 */
export async function clearFolder(path: string, { prefix = "wintry/" } = {}) {
    return void (await NativeFileModule.clearFolder("documents", `${prefix}${path}`));
}

/**
 * Remove file from given path, currently no check for any failure
 * @param path Path to the file
 */
export async function removeFile(path: string, { prefix = "wintry/" } = {}) {
    return void (await NativeFileModule.removeFile("documents", `${prefix}${path}`));
}

/**
 * Check if the file or directory given by the path exists
 * @param path Path to the file
 */
export async function fileExists(path: string, { prefix = "wintry/" } = {}) {
    return await NativeFileModule.fileExists(`${NativeFileModule.getConstants().DocumentsDirPath}/${prefix}${path}`);
}

/**
 * A wrapper to write to a file to the documents directory
 * @param path Path to the file
 * @param data String data to write to the file
 */
export async function writeFile(path: string, data: string, { prefix = "wintry/" } = {}): Promise<void> {
    if (typeof data !== "string") throw new Error("Argument 'data' must be a string");
    return void (await NativeFileModule.writeFile("documents", `${prefix}${path}`, data, "utf8"));
}

/**
 * A wrapper to read a file from the documents directory
 * @param path Path to the file
 * @param fallback Fallback data to return if the file doesn't exist, and will be written to the file
 */
export async function readFile(path: string, { prefix = "wintry/" } = {}): Promise<string> {
    try {
        return await NativeFileModule.readFile(
            `${NativeFileModule.getConstants().DocumentsDirPath}/${prefix}${path}`,
            "utf8",
        );
    } catch (err) {
        throw new Error(`An error occured while writing to '${path}'`, { cause: err });
    }
}

/**
 * Download a file from the given URL and save it to the path given
 * @param url URL to download the file from
 * @param path Path to save the file to
 */
export async function downloadFile(url: string, path: string, { prefix = "wintry/" } = {}) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download file from ${url}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const data = Buffer.from(arrayBuffer).toString("base64");

    return void (await NativeFileModule.writeFile("documents", `${prefix}${path}`, data, "base64"));
}
