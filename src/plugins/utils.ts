import { toDefaulted } from "es-toolkit/compat";
import usePluginStore, { type PluginStore } from "@stores/usePluginStore";
import type {
    DefinedOptions,
    OptionDefinitions,
    PluginSettings,
    PluginState,
    SettingsStore,
    WintryPluginDefinition,
    WintryPluginInstance,
} from "./types";
import { createContextualPatcher, type ContextualPatcher } from "@patcher/contextual";
import type { ReadonlyDeep } from "type-fest";
import { lazyValue } from "@utils/lazy";

const patcherRegistry = new Map<string, ContextualPatcher>();
const settingsDefRegistry = new Map<string, DefinedOptions>();

export let PLUGINS = lazyValue(
    () => {
        PLUGINS = require("#wt-plugins").default;
        return PLUGINS;
    },
    { hint: "object" },
) as Record<string, WintryPluginInstance>;

/**
 * Returns a contextual patcher for the given plugin ID.
 * @param create If there's no existing patcher, a new one will be created.
 */
export function getContextualPatcher(id: string): ContextualPatcher;
export function getContextualPatcher(id: string, create: false): ContextualPatcher | undefined;
export function getContextualPatcher(id: string, create = true): ContextualPatcher | undefined {
    if (patcherRegistry.has(id)) return patcherRegistry.get(id)!;
    if (!create) return undefined;

    const patcher = createContextualPatcher({ id });
    patcherRegistry.set(id, patcher);
    return patcher;
}

/**
 * Returns the settings definition for the given plugin ID. If the plugin ID is not registered, returns `undefined`.
 */
export function getPluginSettings(id: string) {
    return settingsDefRegistry.get(id);
}

export function registerPlugin<P extends WintryPluginDefinition<D>, D extends DefinedOptions>(
    id: string,
    plugin: WintryPluginInstance<D>,
): (relativePath: string) => P {
    const pluginState: PluginState = { running: false };
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
        $isToggleable: {
            value: () => !plugin.required && plugin.isAvailable?.() !== false,
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
        set: (
            updater: Partial<SettingsStore<Def>> | ((state: SettingsStore<Def>) => Partial<SettingsStore<Def>>) | void,
        ) =>
            usePluginStore.setState(state => {
                if (typeof updater === "function") {
                    const ret = updater(state.settings[definition.pluginId] as SettingsStore<Def>);
                    Object.assign(state.settings[definition.pluginId], ret);
                }
                if (updater != null) {
                    Object.assign(state.settings[definition.pluginId], updater);
                }
            }),
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

        // TODO: Implement this?
        // withPrivateSettings<T>() {
        //     return ret;
        // },
    };

    settingsDefRegistry.set(id, definition as DefinedOptions);

    return definition;
}

/**
 * Get the plugin instance by ID
 * @param id The plugin ID to get the instance for
 */
export function getPluginInstance(id: string): WintryPluginInstance | undefined {
    return PLUGINS[id];
}

export function isPluginInternal(plugin: WintryPluginInstance) {
    // TODO: check for .required instead?
    return plugin.$path.startsWith("/_");
}

/**
 * Get the current plugin store state as readonly.
 * This is useful for accessing the plugin settings and states without accidentally modifying them.
 * @returns The current plugin store state
 */
export function getStoreState() {
    return usePluginStore.getState() as ReadonlyDeep<PluginStore>;
}
