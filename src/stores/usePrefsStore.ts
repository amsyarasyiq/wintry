import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { kvStorage } from "@loader/kvStorage";

// biome-ignore lint/suspicious/noEmptyInterface: This is an actual interface, it's just empty
interface PrefsStore {}

const usePrefsStore = create(
    persist<PrefsStore>(set => ({}), {
        name: "prefs-store",
        storage: createJSONStorage(() => kvStorage),
    }),
);

export default usePrefsStore;
