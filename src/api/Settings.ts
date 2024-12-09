import { plugins } from "../plugins";
import SettingsStore from "./classes/SettingsStore";

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
        if (path === "plugins" && key in plugins) {
            return {
                enabled: plugins[key].preenabled !== false || plugins[key].required || false,
            };
        }
    },
).proxy;
