import { Devs } from "@data/constants";
import { byStoreName } from "@metro/filters";
import { waitFor } from "@metro/internal/modules";
import { definePlugin } from "#plugin-context";

let patched: boolean;

// Potential enhancement: Add warning on Experiments page when this plugin is enabled
export default definePlugin({
    name: "Experiments",
    description: "Exposes internal developer sections, allowing Discord experiments overriding",
    authors: [Devs.Pylix],
    requiresRestart: (start, { ranPreinit }) => start && (!ranPreinit || !patched),

    preinit() {
        waitFor(byStoreName.raw("DeveloperExperimentStore"), exports => {
            exports.default = new Proxy(exports.default, {
                get: (target, property, receiver) => {
                    if (property === "isDeveloper") {
                        // If this plugin is running, return true
                        return this.state.running ?? false;
                    }

                    return Reflect.get(target, property, receiver);
                },
            });

            patched = true;
        });
    },
});
