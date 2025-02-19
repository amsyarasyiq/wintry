import { toDefaulted } from "es-toolkit/compat";
import usePluginStore from "@stores/usePluginStore";
import type {
    DefinedOptions,
    OptionDefinitions,
    PluginSettings,
    PluginState,
    SettingsStore,
    WintryPluginDefinition,
    WintryPluginInstance,
} from "./types";

type WithThis<T, This> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (this: This, ...args: A) => R : T[P];
};

// Allows defining a plugin without the state property and allow extra properties
export type LooseWintryPlugin<P> = WithThis<P, WintryPluginInstance>;

const settingsDefRegistry = new Map<string, DefinedOptions<OptionDefinitions>>();

export function registerPlugin<
    P extends WintryPluginDefinition<D, O>,
    D extends DefinedOptions<O>,
    O extends OptionDefinitions,
>(id: string, plugin: LooseWintryPlugin<P>): (relativePath: string) => P {
    const pluginState: PluginState = { running: false, ranPreinit: false };
    const pluginSettings: PluginSettings = toDefaulted(usePluginStore.getState().settings[id] ?? {}, {
        enabled: Boolean(plugin.preenabled === true || plugin.required || false),
    });

    if (settingsDefRegistry.has(id)) {
        const def = settingsDefRegistry.get(id)!.definition;
        setDefaultPluginSettings(def, pluginSettings);
    }

    usePluginStore.persist.rehydrate();
    usePluginStore.setState(state => {
        state.states[id] = pluginState;
        state.settings[id] = pluginSettings;
    });

    // Set runtime properties
    Object.defineProperties(plugin, {
        $id: {
            value: id,
        },
        $state: {
            get: () => usePluginStore.getState().states[id],
        },
        $settings: {
            get: () => usePluginStore.getState().settings[id],
        },
    });

    return relativePath => {
        Object.defineProperties(plugin, {
            $path: {
                value: relativePath || "<unknown>",
            },
        });

        return plugin as P;
    };
}

function setDefaultPluginSettings(def: OptionDefinitions, pluginSettings: PluginSettings) {
    for (const [key, setting] of Object.entries(def)) {
        if (key in pluginSettings) continue;

        if ("default" in setting) pluginSettings[key] = setting.default;
        else {
            switch (setting.type) {
                case "string":
                    pluginSettings[key] = "";
                    break;
                case "boolean":
                    pluginSettings[key] = false;
                    break;
            }
        }

        if ("options" in setting) {
            switch (setting.type) {
                case "radio": {
                    const defaultOption = setting.options.find(opt => opt.default);
                    if (defaultOption != null) pluginSettings[key] = defaultOption?.value ?? null;
                    else pluginSettings[key] = null;
                    break;
                }
                case "select": {
                    const defaults = setting.options.filter(opt => opt.default).map(opt => opt.value);

                    if (defaults.length > 0) pluginSettings[key] = defaults;
                    else pluginSettings[key] = [];
                    break;
                }
            }
        }
    }
}

export function registerPluginSettings<Def extends OptionDefinitions>(id: string, def: Def) {
    const unsubscribers = new Set<() => void>();
    const definition: DefinedOptions<Def> = {
        pluginId: id,
        definition: def,
        get: () => usePluginStore.getState().settings[definition.pluginId] as any,
        use<T>(selector: (state: SettingsStore<Def>) => T) {
            return usePluginStore(state => selector(state.settings[this.pluginId] as SettingsStore<Def>));
        },
        subscribe(selector, listener, options) {
            const unsub = usePluginStore.subscribe(
                state => selector(state.settings[this.pluginId] as SettingsStore<Def>),
                (state, prevState) => listener(state, prevState),
                options,
            );

            unsubscribers.add(unsub);
            return unsub;
        },
        unsubscribeAll() {
            for (const unsub of unsubscribers) unsub();
        },

        // TODO: Implement this
        // withPrivateSettings<T>() {
        //     return ret;
        // },
    };

    settingsDefRegistry.set(id, definition);

    return definition;
}

export function getPluginSettings(id: string): OptionDefinitions {
    return settingsDefRegistry.get(id)?.definition as OptionDefinitions;
}

export function isPluginInternal(plugin: WintryPluginInstance) {
    return plugin.$path.startsWith("/_");
}
