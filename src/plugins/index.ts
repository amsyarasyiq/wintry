import type { WintryPluginInstance } from "./types";

// TODO: Automate this by configuring esbuild
export const PLUGINS: Record<string, WintryPluginInstance> = {
    dummy: require("@plugins/dummy").default,
    "chat-tweaks": require("@plugins/chat-tweaks").default,
    "emote-cloner": require("@plugins/emote-cloner").default,
    experiments: require("@plugins/experiments").default,
    settings: require("@plugins/_core/settings").default,
    "no-track": require("@plugins/_core/no-track").default,
    "error-boundary": require("@plugins/_core/error-boundary").default,
};
