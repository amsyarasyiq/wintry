import { registerCommand } from "@api/commands";
import { interceptFluxEventType, type FluxEvent } from "@api/flux";
import { isSafeModeEnabled } from "@loader";
import { waitFor } from "@metro/internal/modules";
import type { ContextualPatcher } from "@patcher/contextual";
import { logger, usePluginStore } from "@stores/usePluginStore";
import { PLUGINS } from "./utils";
import { getProxyFactory } from "@utils/lazy";
import type { WintryPluginInstance } from "./types";
import { getContextualPatcher, getPluginSettings, getStoreState } from "./utils";

/**
 * Initialize all plugins, this should be called once at the start of the app before index is initialized
 * @internal
 */
export function initializePlugins() {
    usePluginStore.persist.rehydrate(); // Ensure settings are loaded
    getProxyFactory(PLUGINS)?.(); // Ensure plugins are initialized

    const { settings } = getStoreState();

    for (const id in PLUGINS) {
        if (settings[id].enabled) {
            startPlugin(id);
        }
    }
}

/**
 * Toggles the enabled state of a plugin by its ID.
 *
 * @param id - The unique identifier of the plugin to toggle.
 * @param value - Optional. If provided, sets the plugin's enabled state to this value. If omitted, the enabled state is toggled.
 * @param triggerLifecycleEvents - Optional. Whether to trigger the plugin's lifecycle events (`startPlugin` or `cleanupPlugin`). Defaults to `true`.
 *
 * @remarks
 * - If the plugin is already in the desired state, no action is taken.
 * - Lifecycle events are only triggered if `triggerLifecycleEvents` is `true` and safe mode is not enabled.
 */
export function togglePlugin(id: string, value?: boolean, triggerLifecycleEvents = true) {
    const store = getStoreState();
    const enabled = store.settings[id].enabled;
    const target = value ?? !enabled;
    if (target === enabled) return;

    usePluginStore.setState(s => {
        s.settings[id].enabled = target;
    });

    if (triggerLifecycleEvents && !isSafeModeEnabled()) {
        if (target) {
            startPlugin(id);
        } else {
            cleanupPlugin(id);
        }
    }
}

/**
 * Starts a plugin by its ID, initializing what should be initialized and updating its running state.
 *
 * The function performs several safety checks:
 * - Skips starting if safe mode is enabled and the plugin is not required.
 * - Skips if the plugin is not available.
 * - Skips if the plugin is already running.
 *
 * Logs relevant information and errors during the process.
 *
 * @param id - The unique identifier of the plugin to start.
 * @returns void
 */
export function startPlugin(id: string) {
    const plugin = PLUGINS[id];
    const currStore = getStoreState();

    if (isSafeModeEnabled() && !plugin.required) {
        logger.info(`Plugin ${plugin.$id} is not required and safe mode is enabled, skipping`);
        return;
    }

    if (plugin.isAvailable?.() === false) {
        logger.warn(`Plugin ${plugin.$id} is not available, skipping`);
        return;
    }

    if (currStore.states[id].running) {
        logger.warn(`${plugin.$id} already started`);
        return;
    }

    logger.debug(`Starting plugin '${plugin.$id}'`);

    try {
        // Reset our patches context
        const pluginPatcherContext = getContextualPatcher(id);
        pluginPatcherContext.reuse();

        applyPluginCommands(id, plugin, pluginPatcherContext);
        applyPluginPatches(id, plugin, pluginPatcherContext);
        applyPluginFluxInterceptors(id, plugin, pluginPatcherContext);

        usePluginStore.setState(s => {
            s.states[id].running = true;
        });
        plugin.start?.();
    } catch (e) {
        logger.error`Failed to start ${plugin.$id}: ${e}`;
        return;
    }

    return;
}

/**
 * Cleans up and stops a plugin by its ID.
 *
 * This function attempts to dispose of any contextual patchers and calls the plugin's
 * cleanup method if available. If the plugin is already stopped, it logs a warning and exits.
 * After attempting to cleanup, it updates the plugin's running state to false.
 *
 * @param id - The unique identifier of the plugin to clean up.
 * @throws {Error} If attempting to stop a required plugin in development mode.
 */
export function cleanupPlugin(id: string) {
    const plugin = PLUGINS[id];

    if (plugin.required) {
        logger.warn(`Cannot stop required plugin '${plugin.$id}'`);
        if (__DEV__) throw new Error(`Cannot stop required plugin '${plugin.$id}'`);
        return;
    }

    const currStore = getStoreState();
    if (!currStore.states[id].running) {
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

    usePluginStore.setState(s => {
        s.states[id].running = false;
    });
    return;
}

function applyPluginCommands(id: string, plugin: WintryPluginInstance, pluginPatcherContext: ContextualPatcher) {
    if (!plugin.commands) return;

    for (const command of plugin.commands) {
        logger.debug(`Registering command '${command.name}' for plugin '${id}'`);
        const unregister = registerCommand(command);
        pluginPatcherContext.attachDisposer(() => {
            unregister();
            logger.debug(`Unregistered command '${command.name}' for plugin '${id}'`);
        });
    }
}

function applyPluginFluxInterceptors(
    id: string,
    plugin: WintryPluginInstance,
    pluginPatcherContext: ContextualPatcher,
) {
    if (!plugin.flux) return;

    for (const [eventName, cb] of Object.entries(plugin.flux)) {
        const unintercept = interceptFluxEventType(eventName, (event: FluxEvent) => {
            try {
                return cb(event);
            } catch (e) {
                logger.error`${id}: Error while handling ${event.type}: ${e}`;
            }
        });

        logger.debug(`Intercepted flux event '${eventName}' for plugin '${id}'`);

        pluginPatcherContext.attachDisposer(() => {
            unintercept();
            logger.debug(`Unintercepted from flux event '${eventName}' for plugin '${id}'`);
        });
    }
}

function applyPluginPatches(id: string, plugin: WintryPluginInstance, pluginPatcherContext: ContextualPatcher) {
    if (!plugin.patches) return;

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

            pluginPatcherContext.attachDisposer(unsub);
        } else {
            if (!pluginPatch.predicate || pluginPatch.predicate()) apply();
        }
    }
}
