import { patcher } from "#plugin-context";
import { getStore } from "@metro/common/stores";
import { cloneDeep } from "es-toolkit";
import { getCurrentRef } from "../useThemeStore";

const SelectivelySyncedUserSettingsStore = getStore("SelectivelySyncedUserSettingsStore");

export let hasInitialThemeStateBeenRestored = false;

/**
 * Patches the SelectivelySyncedUserSettingsStore to avoid storing non-persistent theme key
 * to the store, and to ensure that the current theme is applied correctly.
 */
export function patchSelectivelySyncedUserSettingsStore() {
    let isPersisting = false;

    patcher.after(SelectivelySyncedUserSettingsStore, "getState", (_, ret) => {
        const currentRef = getCurrentRef();

        if (ret.appearance?.settings?.theme && currentRef) {
            // If not persisting, we return our current theme key instead
            if (!isPersisting && !hasInitialThemeStateBeenRestored) {
                ret.appearance.settings.theme = currentRef.key;
                hasInitialThemeStateBeenRestored = true;
            } else if (isPersisting) {
                // biome-ignore lint/style/noParameterAssign: confusion is worth it
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
