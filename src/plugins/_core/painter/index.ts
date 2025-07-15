import { definePlugin } from "#plugin-context";
import { Devs } from "@data/constants";
import { waitFor } from "@metro/internal/modules";
import { byProps } from "@metro/common/filters";
import patchDefinitionAndResolver from "./patches/resolver";
import { patchSelectivelySyncedUserSettingsStore } from "./patches/stores";
import { applyTheme, useThemeStore } from "./useThemeStore";

export default definePlugin({
    name: "Painter",
    description: "Provides themes functionalities within Wintry",
    authors: [Devs.Pylix],
    required: true,
    start() {
        waitFor(byProps(["SemanticColor"]), tokensModule => {
            patchDefinitionAndResolver(tokensModule);
            patchSelectivelySyncedUserSettingsStore();

            // Apply the initial theme if it exists
            applyTheme(useThemeStore.getState().appliedTheme, false);
        });
    },
});
