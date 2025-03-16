import { Devs } from "@data/constants";
import { waitFor } from "@metro/internal/modules";
import { definePlugin, patcher } from "#plugin-context";
import { UserStore, byStoreName } from "@metro/common/stores";
import { byProps } from "@metro/common/filters";

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
    description: "Exposes internal developer sections, allowing you to override Discord experiments.",
    authors: [Devs.Pylix],

    patches: [
        {
            id: "is-staff-env",
            target: byProps(["isStaffEnv"]),
            patch(module, patcher) {
                patcher.instead(module, "isStaffEnv", ([user]) => {
                    if (user === UserStore.getCurrentUser()) return true;
                });

                reinitStore();
            },
        },
    ],

    cleanup() {
        reinitStore();
    },
});
