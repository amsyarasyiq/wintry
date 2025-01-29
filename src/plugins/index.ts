import type { WintryPluginInstance } from "./types";

// TODO: Automate this by configuring esbuild
export const PLUGINS: Record<string, WintryPluginInstance> = {
    settings: require("@plugins/_core/settings").default,
    "no-track": require("@plugins/_core/no-track").default,
    experiments: require("@plugins/experiments").default,
    dummy: require("@plugins/dummy").default,
    "chat-tweaks": require("@plugins/chat-tweaks").default,
};
