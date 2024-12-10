import { toDefaulted } from "es-toolkit/compat";
import usePluginStore, { type PluginStore } from "../stores/usePluginStore";
import type { OptionDefinitions, PluginSettings, PluginState, WintryPlugin, WintryPluginInstance } from "./types";

type WithThis<T, This> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (this: This, ...args: A) => R : T[P];
};

// Allows defining a plugin without the state property and allow extra properties
type LooseWintryPlugin<P> = WithThis<P, WintryPluginInstance<P>>;

export function definePlugin<P extends WintryPlugin>(id: string, plugin: LooseWintryPlugin<P>): P {
    const pluginState: PluginState = { running: false };
    const pluginSettings: PluginSettings = toDefaulted(usePluginStore.getState().settings[id] ?? {}, {
        enabled: Boolean(plugin.preenabled !== false || plugin.required || false),
    });

    if (typeof plugin.settings === "object") {
        plugin.settings.pluginId = id;

        const def = plugin.settings.definition;

        // Set default values for settings
        for (const key in def) {
            if (!(key in pluginSettings)) {
                if ("default" in def[key]) {
                    pluginSettings[key] = def[key].default;
                } else if ("options" in def[key]) {
                    const val = def[key].options.find(option => option.default === true)?.value;
                    pluginSettings[key] = val;
                }
            }
        }
    }

    usePluginStore.persist.rehydrate();
    usePluginStore.setState(state => {
        state.states[id] = pluginState;
        state.settings[id] = pluginSettings;
    });

    Object.defineProperties(plugin, {
        state: {
            get: () => usePluginStore.getState().states[id],
        },
        settings: {
            get: () => usePluginStore.getState().settings[id],
        },
    });

    return plugin as P;
}

export function definePluginSettings<Def extends OptionDefinitions>(def: Def) {
    const definition = {
        pluginId: "",
        definition: def,
        get: () => usePluginStore.getState().settings[definition.pluginId],
        use<T>(selector: (state: PluginStore["settings"][string]) => T) {
            return usePluginStore(state => selector(state.settings[this.pluginId]));
        },
        // TODO: Implement this
        // withPrivateSettings<T>() {
        //     return ret;
        // },
    };

    return definition;
}
