type Author = { name: string };

export enum StartAt {
    Init = 0,
    MetroReady = 1,
}

export interface PluginState {
    running: boolean;
}

export interface WintryPlugin {
    readonly name: string;
    readonly description: string;
    readonly authors: Author[];

    readonly required?: boolean;
    readonly preenabled?: boolean;

    readonly state?: PluginState;

    /**
     * Called very early, when most APIs are not available and Metro is not ready (you can't forcefully load modules).
     * You can patch modules which are loaded before the index module is initialized here.
     */
    readonly preinit?: () => void;

    /**
     * This is called once the index module is loaded and you can force lookup modules from here.
     */
    readonly start?: () => void;

    /**
     * Called when the plugin is stopped whether by user action or due to an error.
     * Cleanup any patches you made here IN THE CASE where the patches can be redone without a restart.
     * Otherwise, try to use plugin's state to hide the plugin effects.
     */
    readonly cleanup?: () => void;

    /**
     * Called when the plugin is stopped by user action.
     * Return true to manually handle the plugin stop.
     * @param stop Function to stop the plugin
     */
    readonly onStopRequest?: (stop: () => void) => boolean;
}

type WithMandatory<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type WithThis<T, This> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (this: This, ...args: A) => R : T[P];
};

// Allows defining a plugin without the state property and allow extra properties
type LooseWintryPlugin<P> = WithThis<P, P & WithMandatory<WintryPlugin, "state">>;

export function definePlugin<P extends WintryPlugin>(plugin: LooseWintryPlugin<P>): P {
    // @ts-expect-error
    plugin.state = { running: true }; // running always true because we can't have user stop the plugin yet
    return plugin as P;
}
