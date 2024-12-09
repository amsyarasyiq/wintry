import { lazyDestructure } from "../utils/lazy";
import SettingsStore from "./classes/SettingsStore";

// Prevent circular dependency
const { PLUGINS } = lazyDestructure(() => require("../plugins"));

interface WintrySettings {
    safeMode: boolean;
    plugins: {
        [plugin: string]: {
            enabled: boolean;
            [setting: string]: any;
        };
    };
}

export default new SettingsStore<WintrySettings>(
    "settings",
    {
        safeMode: false,
        plugins: {},
    },
    ({ key, path }) => {
        if (path === "plugins" && key in PLUGINS) {
            return {
                enabled: PLUGINS[key].preenabled !== false || PLUGINS[key].required || false,
            };
        }
    },
).proxy;
