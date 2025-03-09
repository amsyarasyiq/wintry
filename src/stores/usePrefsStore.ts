import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { kvStorage } from "@utils/kvStorage";

interface PrefsStore {
    safeMode: boolean;

    toggleSafeMode: (to: boolean) => void;
}

const usePrefsStore = create(
    persist<PrefsStore>(
        set => ({
            safeMode: false,
            toggleSafeMode: to => set({ safeMode: to }),
        }),
        {
            name: "prefs-store",
            storage: createJSONStorage(() => kvStorage),
        },
    ),
);

let initialState: PrefsStore | null = null;
const unsub = usePrefsStore.persist.onFinishHydration(state => {
    initialState = state;
    unsub();
});

/**
 * Determines if safe mode is currently enabled. The result remains consistent over time.
 * This will not change until the app is restarted. For draft changes, use the PrefsStore directly.
 * @returns True if safe mode is enabled for the current instance, otherwise false.
 */
export function isSafeModeEnabled() {
    if (!initialState) usePrefsStore.persist.rehydrate();
    return initialState!.safeMode === true;
}

export default usePrefsStore;
