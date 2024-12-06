import { StartAt, type WintryPlugin } from "./types";

const CorePlugins: Array<WintryPlugin> = [require("./_core/settings").default, require("./_core/no-track").default];

const Plugins: Array<WintryPlugin> = [require("./experiments").default];

export function startAllPlugins(stage: StartAt) {
    for (const plugin of CorePlugins.concat(Plugins)) {
        if (stage === StartAt.Init) {
            plugin.preinit?.();
        } else if (stage === StartAt.MetroReady) {
            plugin.start?.();
        }
    }
}
