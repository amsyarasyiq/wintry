import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { kvStorage } from "@loader/kvStorage";
import type { PluginSettings, PluginState } from "@plugins/types";
import { wtlogger } from "@api/logger";

export const logger = wtlogger.createChild("PluginStore");
export interface PluginStore {
    settings: Record<string, PluginSettings>;
    states: Record<string, PluginState>;
}

const usePluginStore = create(
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
