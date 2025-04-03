import { createStore } from "zustand";
import type { WintryTheme } from "./types";
import { parseColorManifest } from "./parser";
import { wtlogger } from "@api/logger";
import { MOCHA_THEME } from "./example_theme";
import { lookupByProps } from "@metro/common/wrappers";
import { createJSONStorage, persist } from "zustand/middleware";
import { kvStorage } from "@loader/kvStorage";

const logger = wtlogger.createChild("useThemeStore");
const formDividerModule = lookupByProps("DIVIDER_COLORS");

const tokenRefModule = lookupByProps("SemanticColor");
const UserSettingsActionCreators = lookupByProps("updateTheme", "setShouldSyncAppearanceSettings").asLazy();

interface ThemeStore {
    appliedTheme: string | null;
    currentRef: ThemeRefState | null;

    themes: WintryTheme[];
    setThemeRef: (id: string | null) => void;
}

interface ThemeRefState {
    key: string;
    color: ReturnType<typeof parseColorManifest>;
}

let _inc = 0;

export function getCurrentRef() {
    return useThemeStore.getState().currentRef;
}

// TODO: For debugging only, remove once done
window.applyTheme = applyTheme;

export function applyTheme(id: string | null, update = true) {
    useThemeStore.getState().setThemeRef(id);
    const ref = getCurrentRef();

    if (id && ref) {
        // "Register" our theme
        formDividerModule.wait(exp => {
            exp.DIVIDER_COLORS[ref.key] = exp.DIVIDER_COLORS[ref.color.reference];
        });

        tokenRefModule.wait(tokenRef => {
            tokenRef.Theme[ref.key.toUpperCase()] = ref.key;

            const shadowKeys = Object.keys(tokenRef.Shadow);
            const semanticKeys = Object.keys(tokenRef.SemanticColor);

            for (let i = 0; i < shadowKeys.length; i++) {
                const k = shadowKeys[i];
                tokenRef.Shadow[k][ref.key] = tokenRef.Shadow[k][ref.color.reference];
            }

            for (let i = 0; i < semanticKeys.length; i++) {
                const k = semanticKeys[i];
                tokenRef.SemanticColor[k][ref.key] = {
                    ...tokenRef.SemanticColor[k][ref.color.reference],
                };
            }
        });
    }

    if (update) {
        const manifest = id != null && useThemeStore.getState().themes.find(t => t.id === id);

        // biome-ignore lint/complexity/useOptionalChain: ?. won't filter out falsys
        const base = ref?.color.reference || (manifest && manifest.main.base) || "darker";

        UserSettingsActionCreators.setShouldSyncAppearanceSettings(false);
        UserSettingsActionCreators.updateTheme(ref ? ref.key : base);
    }
}

export const useThemeStore = createStore(
    persist<ThemeStore>(
        (set, get) => ({
            appliedTheme: null,
            currentRef: null,
            themes: [MOCHA_THEME],
            setThemeRef: (id: string | null) => {
                if (id == null) {
                    set({ appliedTheme: null, currentRef: null });
                    return;
                }

                const theme = get().themes.find(t => t.id === id);
                if (!theme) throw new Error(`Theme is not installed: ${id}`);

                set({
                    appliedTheme: id,
                    currentRef: {
                        key: `wt-theme-${_inc++}`,
                        color: parseColorManifest(theme),
                    },
                });
            },
        }),
        {
            name: "theme-store",
            storage: createJSONStorage(() => kvStorage),
            partialize: s => ({
                ...s,
                currentRef: null,
            }),
        },
    ),
);

// Apply our custom theme on startup
applyTheme(useThemeStore.getState().appliedTheme, false);
