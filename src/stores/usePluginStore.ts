import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { kvStorage } from "@loader/kvStorage";
import type { PluginSettings, PluginState, WintryPluginInstance } from "@plugins/types";
import { getProxyFactory, lazyValue } from "@utils/lazy";
import { wtlogger } from "@api/logger";
import { isSafeModeEnabled } from "@loader";
import { waitFor } from "@metro/internal/modules";
import { getContextualPatcher, getPluginSettings } from "@plugins/utils";

const logger = wtlogger.createChild("PluginStore");
const PLUGINS = lazyValue(() => require("#wt-plugins").default, { hint: "object" }) as Record<
    string,
    WintryPluginInstance
>;

export interface PluginStore {
    settings: Record<string, PluginSettings>;
    states: Record<string, PluginState>;

    togglePlugin: (id: string, value?: boolean, startOrStop?: boolean) => void;
    startPlugin: (id: string) => void;
    cleanupPlugin: (id: string) => void;
}

function startPlugin(draft: PluginStore, id: string) {
    const plugin = PLUGINS[id];

    if (isSafeModeEnabled() && !plugin.required) {
        logger.info(`Plugin ${plugin.$id} is not required and safe mode is enabled, skipping`);
        return;
    }

    if (plugin.isAvailable?.() === false) {
        logger.warn(`Plugin ${plugin.$id} is not available, skipping`);
        return;
    }

    if (draft.states[id].running) {
        logger.warn(`${plugin.$id} already started`);
        return;
    }

    logger.debug(`Starting plugin '${plugin.$id}'`);

    try {
        applyPluginPatches(id, plugin);

        draft.states[id].running = true;
        plugin.start?.();
    } catch (e) {
        logger.error`Failed to start ${plugin.$id}: ${e}`;
        return;
    }

    return;
}

function applyPluginPatches(id: string, plugin: WintryPluginInstance) {
    if (!plugin.patches) return;

    const pluginPatcherContext = getContextualPatcher(id);
    pluginPatcherContext.reuse();

    for (const pluginPatch of plugin.patches) {
        const patcher = pluginPatcherContext.createChild({
            id: pluginPatch.id ?? pluginPatch.target.key,
        });

        const apply = () => {
            logger.debug(`Applying ${patcher.id} patch`);

            patcher.reuse();
            waitFor(pluginPatch.target, module => {
                pluginPatch.patch(module, patcher);
            });
        };

        const settings = getPluginSettings(id);

        if (settings && pluginPatch.predicate) {
            const { predicate } = pluginPatch;
            const unsub = settings.subscribe(
                () => predicate(),
                () => {
                    if (predicate()) {
                        apply();
                    } else {
                        logger.debug(`Disposing ${patcher.id} patch`);
                        patcher.dispose();
                    }
                },
                { fireImmediately: true },
            );

            pluginPatcherContext.addDisposer(unsub);
        } else {
            if (!pluginPatch.predicate || pluginPatch.predicate()) apply();
        }
    }
}

function cleanupPlugin(draft: PluginStore, id: string) {
    const plugin = PLUGINS[id];

    if (plugin.required) {
        logger.warn(`Cannot stop required plugin '${plugin.$id}'`);
        if (__DEV__) throw new Error(`Cannot stop required plugin '${plugin.$id}'`);
        return;
    }

    if (!draft.states[id].running) {
        logger.warn(`${plugin.$id} already stopped`);
        return;
    }

    logger.info(`Cleaning up plugin ${plugin.$id}`);

    try {
        const patcher = getContextualPatcher(id, false);
        if (patcher) {
            patcher.dispose();
            patcher.children.length = 0;
        }

        plugin.cleanup?.();
    } catch (e) {
        logger.error(`Failed to cleanup ${plugin.$id}: ${e}`);
        return;
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
                        if (startOrStop && !isSafeModeEnabled()) {
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
