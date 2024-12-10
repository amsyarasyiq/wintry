import { toDefaulted } from "es-toolkit/compat";
import usePluginStore from "../stores/usePluginStore";
import type { PluginSettings, PluginState, WintryPlugin, WintryPluginInstance } from "./types";

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

export function definePluginSettings() {
    return usePluginStore.getState().settings;
}
