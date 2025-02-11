import { NativeFileModule } from "@native";
import { LoaderPayload } from "@native/loader";

const BASE_DIR = "wintry";
const ENCODING = "utf8";

function getFullPath(path: string): string {
    return `${LoaderPayload.constants.WINTRY_DIR}/${path}`;
}

/**
 * Removes all files in a directory from the path given
 * @param path Path to the targeted directory
 */
export async function clearFolder(path: string): Promise<void> {
    await NativeFileModule.clearFolder(BASE_DIR, path);
}

/**
 * Remove file from given path
 * @param path Path to the file
 */
export async function removeFile(path: string): Promise<void> {
    await NativeFileModule.removeFile(BASE_DIR, path);
}

/**
 * Check if the file or directory given by the path exists
 * @param path Path to the file
 */
export async function fileExists(path: string): Promise<boolean> {
    return await NativeFileModule.fileExists(getFullPath(path));
}

/**
 * Write data to a file in the documents directory
 * @param path Path to the file
 * @param data String data to write to the file
 * @throws Error if data is not a string
 */
export async function writeFile(path: string, data: string): Promise<void> {
    if (typeof data !== "string") {
        throw new TypeError("Argument 'data' must be a string");
    }
    await NativeFileModule.writeFile(BASE_DIR, path, data, ENCODING);
}

/**
 * Read a file from the documents directory
 * @param path Path to the file
 * @throws Error if reading fails
 */
export async function readFile(path: string): Promise<string> {
    try {
        return await NativeFileModule.readFile(getFullPath(path), ENCODING);
    } catch (err) {
        throw new Error(`Failed to read file '${path}'`, { cause: err });
    }
}

/**
 * Download a file from the given URL and save it to the path given
 * @param url URL to download the file from
 * @param path Path to save the file to
 * @throws Error if download fails
 */
export async function downloadFile(url: string, path: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download file from ${url}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const data = Buffer.from(arrayBuffer).toString("base64");
    await NativeFileModule.writeFile(BASE_DIR, path, data, "base64");
}
