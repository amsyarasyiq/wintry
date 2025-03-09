import { writeFile } from "@api/fs";
import { loaderPayload } from "@loader";
import type { InitConfig } from "@loader/types";
import { create } from "zustand";

interface InitConfigStore {
    config: InitConfig;

    toggleSafeMode: (to: boolean) => void;
}

export const useInitConfigStore = create<InitConfigStore>(set => ({
    config: loaderPayload.loader.initConfig,
    toggleSafeMode: (to: boolean) => set(s => ({ config: { ...s.config, safeMode: to } })),
}));

useInitConfigStore.subscribe(state => {
    writeFile("init_config.json", JSON.stringify(state.config));
});
