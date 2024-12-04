import { $ } from "bun";

const packageName = process.env.DISCORD_PACKAGE_NAME ?? "com.discord";

export function getPackageName() {
    return packageName;
}

export async function isADBAvailableAndAppInstalled() {
    try {
        const out = await $`adb shell pm list packages ${packageName}`.quiet();
        return out.text().trimEnd() === `package:${packageName}`;
    } catch {
        return false;
    }
}
export async function restartAppFromADB(reversePort: number | undefined) {
    if (typeof reversePort === "number") {
        await $`adb reverse tcp:${reversePort} tcp:${reversePort}`.quiet();
    }

    await forceStopAppFromADB();
    await $`adb shell am start ${packageName}/com.discord.main.MainActivity`.quiet();
}

export async function forceStopAppFromADB() {
    await $`adb shell am force-stop ${packageName}`.quiet();
}
