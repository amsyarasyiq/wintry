import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand";
import { kvStorage } from "../api/kvStorage";

interface PrefsStore {
    safeMode: boolean;
}

const PrefsStore = createStore(
    persist<PrefsStore>(
        () => ({
            safeMode: false,
        }),
        {
            name: "prefs-store",
            storage: createJSONStorage(() => kvStorage),
        },
    ),
);

let initialState: PrefsStore | null = null;
const unsub = PrefsStore.persist.onFinishHydration(state => {
    initialState = state;
    unsub();
});

/**
 * Determines if safe mode is currently enabled. The result remains consistent over time.
 * This will not change until the app is restarted. For draft changes, use the PrefsStore directly.
 * @returns True if safe mode is enabled for the current instance, otherwise false.
 */
export function isSafeModeEnabled() {
    if (!initialState) {
        throw new Error("PrefsStore is not hydrated yet");
    }

    return initialState.safeMode === true;
}

export default PrefsStore;
