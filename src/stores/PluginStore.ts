import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { hasIndexInitialized } from "..";
import { metroEventEmitter } from "../metro/internal/events";
import { createJSONStorage, persist } from "zustand/middleware";
import { kvStorage } from "../api/kvStorage";
import type { PluginSettings, PluginState } from "../plugins/types";
import { getProxyFactory, lazyValue } from "../utils/lazy";

// Prevent circular dependency
const PLUGINS = lazyValue(() => require("../plugins").PLUGINS);

interface PluginStore {
    settings: Record<string, PluginSettings>;
    states: Record<string, PluginState>;

    togglePlugin: (id: string, value?: boolean) => void;
    startPlugin: (id: string) => void;
    cleanupPlugin: (id: string) => void;
}

function startPlugin(draft: PluginStore, id: string) {
    const plugin = PLUGINS[id];

    if (draft.states[id].running) {
        console.warn(`${plugin.name} already started`);
        return;
    }

    if (plugin.requiresRestart?.({ isInit: !hasIndexInitialized })) {
        console.warn(`${plugin.name} requires restart`);
        return;
    }

    const start = () => {
        console.info(`Starting plugin ${plugin.name}`);

        try {
            plugin.start();
        } catch (e) {
            console.error(`Failed to start ${plugin.name}: ${e}`);
            return;
        }
    };

    if (plugin.preinit && !hasIndexInitialized) {
        console.info("Preinitializing plugin", plugin.name);

        try {
            plugin.preinit();
        } catch (e) {
            console.error(`Failed to preinitialize ${plugin.name}\n`, e);
            return;
        }
    }

    if (plugin.start) {
        if (hasIndexInitialized) {
            start();
        } else {
            metroEventEmitter.once("metroReady", () => start());
            console.log(`Queued plugin ${plugin.name} for start`);
        }
    }

    draft.states[id].running = true;
    return;
}

function cleanupPlugin(draft: PluginStore, id: string) {
    const plugin = PLUGINS[id];

    if (!draft.states[id].running) {
        console.warn(`${plugin.name} already stopped`);
        return;
    }

    if (plugin.cleanup) {
        console.info("Cleaning up plugin", plugin.name);

        try {
            plugin.cleanup();
        } catch (e) {
            console.error(`Failed to cleanup ${plugin.name}: ${e}`);
            return;
        }
    }

    draft.states[id].running = false;
    return;
}

/**
 * Initialize all plugins, this should be called once at the start of the app before index is initialized
 * @internal
 */
export function initializePlugins() {
    PluginStore.persist.rehydrate(); // Ensure settings are loaded
    getProxyFactory(PLUGINS)?.(); // Ensure plugins are initialized

    const { startPlugin, settings } = PluginStore.getState();

    for (const id in PLUGINS) {
        if (settings[id].enabled) {
            startPlugin(id);
        }
    }
}

const PluginStore = createStore(
    persist(
        immer<PluginStore>((set, get) => ({
            settings: {} as Record<string, PluginSettings>,
            states: {} as Record<string, PluginState>,

            /**
             * Toggle a plugin's enabled state
             */
            togglePlugin: (id: string, value?: boolean, startOrStop = true) =>
                set(draft => {
                    const target = value ?? !draft.settings[id].enabled;
                    if (target === draft.settings[id].enabled) return;

                    draft.settings[id].enabled = target;
                    if (startOrStop) {
                        if (draft.settings[id].enabled) {
                            startPlugin(draft, id);
                        } else {
                            cleanupPlugin(draft, id);
                        }
                    }
                }),

            startPlugin: (id: string) => set(draft => startPlugin(draft, id)),
            cleanupPlugin: (id: string) => set(draft => cleanupPlugin(draft, id)),
        })),
        {
            name: "plugin-store",
            storage: createJSONStorage(() => kvStorage),
            partialize: state => ({ settings: state.settings }),
        },
    ),
);

export default PluginStore;
