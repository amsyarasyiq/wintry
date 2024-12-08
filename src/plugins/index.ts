import Settings from "../api/Settings";
import { StartAt, type WintryPlugin } from "./types";

export const Plugins: Record<string, WintryPlugin> = {
    settings: require("./_core/settings").default,
    "no-track": require("./_core/no-track").default,
    experiments: require("./experiments").default,
};

export function startAllPlugins(stage: StartAt) {
    for (const [id, plugin] of Object.entries(Plugins)) {
        if (Settings.store.plugins[id].enabled) {
            if (stage === StartAt.Init) {
                plugin.preinit?.();
            } else if (stage === StartAt.MetroReady) {
                plugin.start?.();
            }
        }
    }
}
