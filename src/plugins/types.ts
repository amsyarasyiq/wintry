import { produce } from "immer";
import PluginStore from "../stores/PluginStore";
import { toDefaulted } from "es-toolkit/compat";

type Author = { name: string };

export enum StartAt {
    Init = 0,
    MetroReady = 1,
}

export interface PluginState {
    running: boolean;
}

export interface PluginSettings {
    enabled: boolean;
    [key: string]: any;
}

export interface WintryPlugin {
    readonly name: string;
    readonly description: string;
    readonly authors: Author[];

    readonly required?: boolean;
    readonly preenabled?: boolean;

    readonly state?: PluginState;

    /**
     * A check if the plugin can be started without a restart.
     * If true, the plugin will not load.
     */
    // Probably should have better naming here
    readonly requiresRestart?: ({ isInit }: { isInit: boolean }) => boolean;

    /**
     * Called very early, when most APIs are not available and Metro is not ready (you can't forcefully load modules).
     * You can patch modules which are loaded before the index module is initialized here. (e.g. waitFor)
     */
    readonly preinit?: () => void;

    /**
     * This is called once the index module is loaded and you can force lookup modules from here.
     */
    readonly start?: () => void;

    /**
     * Called when the plugin is stopped whether by user action or due to an error.
     * Cleanup any patches you made here IN THE CASE where the patches can be redone without a restart.
     * Otherwise, try to use plugin's state to hide the plugin effects (from the patches).
     */
    readonly cleanup?: () => void;

    /**
     * Called when the plugin is stopped by user action.
     * Return true to manually handle the plugin stop.
     * @param stop Function to stop the plugin
     */
    readonly onStopRequest?: (stop: () => void) => boolean;
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type WithThis<T, This> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (this: This, ...args: A) => R : T[P];
};

// Allows defining a plugin without the state property and allow extra properties
export type WintryPluginInstance<P = Record<string, unknown>> = P & WithRequired<WintryPlugin, "state">;
type LooseWintryPlugin<P> = WithThis<P, WintryPluginInstance<P>>;

export function definePlugin<P extends WintryPlugin>(id: string, plugin: LooseWintryPlugin<P>): P {
    const pluginState: PluginState = { running: false };
    const pluginSettings: PluginSettings = toDefaulted(PluginStore.getState().settings[id] ?? {}, {
        enabled: Boolean(plugin.preenabled !== false || plugin.required || false),
    });

    PluginStore.persist.rehydrate();
    PluginStore.setState(
        produce(state => {
            state.states[id] = pluginState;
            state.settings[id] = pluginSettings;
        }),
    );

    console.log({ state: PluginStore.getState() });

    Object.defineProperty(plugin, "state", {
        get: () => PluginStore.getState().states[id],
    });

    Object.defineProperty(plugin, "settings", {
        get: () => PluginStore.getState().settings[id],
    });

    return plugin as P;
}
