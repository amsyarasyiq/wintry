import { toDefaulted } from "es-toolkit/compat";
import usePluginStore from "../stores/usePluginStore";
import type {
    DefinedOptions,
    OptionDefinitions,
    PluginSettings,
    PluginState,
    SettingsStore,
    WintryPlugin,
    WintryPluginInstance,
} from "./types";

type WithThis<T, This> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (this: This, ...args: A) => R : T[P];
};

// Allows defining a plugin without the state property and allow extra properties
export type LooseWintryPlugin<P> = WithThis<P, WintryPluginInstance>;

const settingsDefRegistry = new Map<string, DefinedOptions<OptionDefinitions>>();

export function registerPlugin<P extends WintryPlugin<D, O>, D extends DefinedOptions<O>, O extends OptionDefinitions>(
    id: string,
    plugin: LooseWintryPlugin<P>,
): P {
    const pluginState: PluginState = { running: false, ranPreinit: false };
    const pluginSettings: PluginSettings = toDefaulted(usePluginStore.getState().settings[id] ?? {}, {
        enabled: Boolean(plugin.preenabled === true || plugin.required || false),
    });

    if (settingsDefRegistry.has(id)) {
        const def = settingsDefRegistry.get(id)!.definition;

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
        id: {
            value: id,
        },
        state: {
            get: () => usePluginStore.getState().states[id],
        },
        settings: {
            get: () => usePluginStore.getState().settings[id],
        },
    });

    return plugin as P;
}

export function registerPluginSettings<Def extends OptionDefinitions>(id: string, def: Def) {
    const definition: DefinedOptions<Def> = {
        pluginId: id,
        definition: def,
        get: () => usePluginStore.getState().settings[definition.pluginId] as any,
        use<T>(selector: (state: SettingsStore<Def>) => T) {
            return usePluginStore(state => selector(state.settings[this.pluginId] as SettingsStore<Def>));
        },
        // TODO: Implement this
        // withPrivateSettings<T>() {
        //     return ret;
        // },
    };

    settingsDefRegistry.set(id, definition);

    return definition;
}
