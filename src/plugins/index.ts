import settings from "../api/settings";
import { StartAt, type WintryPlugin } from "./types";

export const plugins: Record<string, WintryPlugin> = {
    settings: require("./_core/settings").default,
    "no-track": require("./_core/no-track").default,
    experiments: require("./experiments").default,
};

export function startAllPlugins(stage: StartAt) {
    for (const [id, plugin] of Object.entries(plugins)) {
        if (settings.plugins[id].enabled) {
            if (stage === StartAt.Init) {
                plugin.preinit?.();
            } else if (stage === StartAt.MetroReady) {
                plugin.start?.();
            }
        }
    }
}
