import { Devs } from "@data/constants";
import { waitFor } from "@metro/internal/modules";
import { definePlugin, meta } from "#plugin-context";
import { UserStore, byStoreName } from "@metro/common/stores";
import { createContextualPatcher } from "@patcher/contextual";
import { byProps } from "@metro/common/filters";

const patcher = createContextualPatcher({ pluginId: meta.id });

// Reinitialize DeveloperExperimentStore to apply the patches
function reinitStore() {
    waitFor(byStoreName("DeveloperExperimentStore", { checkEsmDefault: true }), DeveloperExperimentStore => {
        const unpatch = patcher.detached.instead(Object, "defineProperties", () => {});
        DeveloperExperimentStore.initialize();
        unpatch();
    });
}

// Potential enhancement: Add warning on Experiments page when this plugin is enabled
export default definePlugin({
    name: "Experiments",
    description: "Exposes internal developer sections, allowing Discord experiments overriding",
    authors: [Devs.Pylix],

    start() {
        patcher.reset();
        waitFor(byProps(["isStaffEnv"]), UserStoreUtils => {
            patcher.instead(UserStoreUtils, "isStaffEnv", ([user]) => {
                if (user === UserStore.getCurrentUser()) return true;
            });

            reinitStore();
        });
    },

    cleanup() {
        patcher.dispose();
        reinitStore();
    },
});
