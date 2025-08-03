import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { kvStorage } from "@loader/kvStorage";
import type { PluginSettings, PluginState, WintryPluginInstance } from "@plugins/types";
import { lazyValue } from "@utils/lazy";
import { wtlogger } from "@api/logger";
import {} from "@plugins/lifecycle";

export const logger = wtlogger.createChild("PluginStore");
export let PLUGINS = lazyValue(() => (PLUGINS = require("#wt-plugins").default), { hint: "object" }) as Record<
    string,
    WintryPluginInstance
>;

export interface PluginStore {
    settings: Record<string, PluginSettings>;
    states: Record<string, PluginState>;
}

export const usePluginStore = create(
    subscribeWithSelector(
        persist(
            immer<PluginStore>(set => ({
                settings: {} as Record<string, PluginSettings>,
                states: {} as Record<string, PluginState>,
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
