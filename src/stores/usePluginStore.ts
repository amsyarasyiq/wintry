import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { kvStorage } from "@utils/kvStorage";
import type { PluginSettings, PluginState } from "@plugins/types";
import { getProxyFactory, lazyValue } from "@utils/lazy";
import { wtlogger } from "@api/logger";

const logger = wtlogger.createChild("plugin-store");
const PLUGINS = lazyValue(() => require("#wt-plugins").default, { hint: "object" });

export interface PluginStore {
    settings: Record<string, PluginSettings>;
    states: Record<string, PluginState>;

    togglePlugin: (id: string, value?: boolean, startOrStop?: boolean) => void;
    startPlugin: (id: string) => void;
    cleanupPlugin: (id: string) => void;
}

function startPlugin(draft: PluginStore, id: string) {
    const plugin = PLUGINS[id];

    if (draft.states[id].running) {
        logger.warn(`${plugin.$id} already started`);
        return;
    }

    const start = () => {
        logger.info(`Starting plugin ${plugin.$id}`);

        try {
            plugin.start?.();
        } catch (e) {
            logger.error`Failed to start ${plugin.$id}: ${e}`;
            return;
        }
    };

    if (plugin.start) {
        start();
    }

    draft.states[id].running = true;
    return;
}

function cleanupPlugin(draft: PluginStore, id: string) {
    const plugin = PLUGINS[id];

    if (!draft.states[id].running) {
        logger.warn(`${plugin.$id} already stopped`);
        return;
    }

    if (plugin.cleanup) {
        logger.info(`Cleaning up plugin ${plugin.$id}`);

        try {
            plugin.cleanup();
        } catch (e) {
            logger.error(`Failed to cleanup ${plugin.$id}: ${e}`);
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
    usePluginStore.persist.rehydrate(); // Ensure settings are loaded
    getProxyFactory(PLUGINS)?.(); // Ensure plugins are initialized

    const { startPlugin, settings } = usePluginStore.getState();

    for (const id in PLUGINS) {
        if (settings[id].enabled) {
            startPlugin(id);
        }
    }
}

const usePluginStore = create(
    subscribeWithSelector(
        persist(
            immer<PluginStore>(set => ({
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
    ),
);

export default usePluginStore;
