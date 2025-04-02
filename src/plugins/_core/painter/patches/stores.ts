import { patcher } from "#plugin-context";
import { getStore } from "@metro/common/stores";
import { cloneDeep } from "es-toolkit";
import { getCurrentRef } from "../useThemeStore";

const SelectivelySyncedUserSettingsStore = getStore("SelectivelySyncedUserSettingsStore");

export function patchSelectivelySyncedUserSettingsStore() {
    let isPersisting = false;
    let modifiedInitialState = false;

    patcher.after(SelectivelySyncedUserSettingsStore, "getState", (_, ret) => {
        const currentRef = getCurrentRef();

        if (ret.appearance?.settings?.theme && currentRef) {
            if (!isPersisting && !modifiedInitialState) {
                modifiedInitialState = true;
                ret.appearance.settings.theme = currentRef.key;
            } else if (isPersisting) {
                // biome-ignore lint/style/noParameterAssign: no u
                ret = cloneDeep(ret);
                ret.appearance.settings.theme = currentRef.color.reference;
            }
        }

        return ret;
    });

    patcher.instead(SelectivelySyncedUserSettingsStore, "persist", (_, orig) => {
        isPersisting = true;
        try {
            orig();
        } finally {
            isPersisting = false;
        }
    });
}
