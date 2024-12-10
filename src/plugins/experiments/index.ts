import { byStoreName } from "../../metro/filters";
import { waitFor } from "../../metro/internal/modules";
import { definePlugin } from "../utils";

let patched: boolean;

export default definePlugin("experiments", {
    name: "Experiments",
    description: "Expose super secret developer & staff experiments",
    authors: [{ name: "pylixonly" }],
    requiresRestart: ({ isInit }) => !isInit && !patched,

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
