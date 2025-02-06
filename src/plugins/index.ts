import type { WintryPluginInstance } from "./types";

// TODO: Automate this by configuring esbuild
export const PLUGINS: Record<string, WintryPluginInstance> = {
    "expression-utils": require("@plugins/expression-utils").default,
    settings: require("@plugins/_core/settings").default,
    "no-track": require("@plugins/_core/no-track").default,
    toasts: require("@plugins/_api/toasts").default,
    experiments: require("@plugins/experiments").default,
    dummy: require("@plugins/dummy").default,
    "chat-tweaks": require("@plugins/chat-tweaks").default,
};
