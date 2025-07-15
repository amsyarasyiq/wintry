import { wtlogger } from "@api/logger";
import { kvStorage } from "@loader/kvStorage";
import { lookupByProps } from "@metro/common/wrappers";
import { memoize } from "es-toolkit";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MOCHA_THEME } from "./example_theme";
import { ROSIE_PINK_THEME } from "./example_theme_1";
import { parseColorManifest } from "./parser";
import type { WintryTheme } from "./types";

const logger = wtlogger.createChild("ThemeStore");
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

let _inc = 4;

export function getCurrentRef() {
    return useThemeStore.getState().currentRef;
}

// TODO: For debugging only, remove once done
window.applyTheme = applyTheme;

export function applyTheme(id: string | null, update: boolean) {
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

export const useThemeStore = create(
    persist<ThemeStore>(
        (set, get) => ({
            appliedTheme: null,
            currentRef: null,
            themes: [MOCHA_THEME, ROSIE_PINK_THEME],
            setThemeRef: (id: string | null) => {
                set({ appliedTheme: null, currentRef: null });

                if (id != null) {
                    const theme = get().themes.find(t => t.id === id);
                    if (!theme) throw new Error(`Theme is not installed: ${id}`);

                    set({
                        appliedTheme: id,
                        currentRef: {
                            key: `wt-theme-${_inc++}`,
                            color: parseColorManifest(theme),
                        },
                    });
                }
            },
        }),
        {
            name: "theme-store",
            version: 2,
            storage: createJSONStorage(() => kvStorage),
            onRehydrateStorage() {
                return state => {
                    if (state && state.themes.length !== 0) {
                        for (const theme of state.themes) {
                            theme.asAddonMetadata = memoize(() => ({
                                id: theme.id,
                                name: theme.display.name,
                                description: theme.display.description,
                                authors: theme.display.authors,
                            }));
                        }
                    }
                };
            },
            partialize: s => ({
                ...s,
                currentRef: null,
            }),
        },
    ),
);
