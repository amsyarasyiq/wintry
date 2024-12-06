import { StartAt, type WintryPlugin } from "./types";

const Plugins: Array<WintryPlugin> = [];

export function startAllPlugins(stage: StartAt) {
    for (const plugin of Plugins) {
        if (stage === StartAt.Init) {
            plugin.preinit?.();
        } else if (stage === StartAt.MetroReady) {
            plugin.start?.();
        }
    }
}
