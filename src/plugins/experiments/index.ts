import { byStoreName } from "../../metro/filters";
import { waitFor } from "../../metro/internal/modules";
import { definePlugin } from "../types";

export default definePlugin({
    name: "Developer",
    description: "Adds a badge to staff members",
    authors: [{ name: "pylixonly" }],

    preinit() {
        const plugin = this;

        waitFor(byStoreName.raw("DeveloperExperimentStore"), exports => {
            exports.default = new Proxy(exports.default, {
                get(target, property, receiver) {
                    if (property === "isDeveloper") {
                        return plugin.state.running ?? false;
                    }

                    return Reflect.get(target, property, receiver);
                },
            });
        });
    },
});
