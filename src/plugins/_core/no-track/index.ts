import { byProps } from "../../../metro/filters";
import { waitFor } from "../../../metro/internal/modules";
import { definePlugin } from "../../utils";

export default definePlugin("no-track", {
    name: "NoTrack",
    description: "Prevents Discord's tracking analytics and Sentry crash reporting",
    authors: [{ name: "pylixonly" }],
    required: true,

    preinit() {
        waitFor(byProps("initSentry"), exports => {
            exports.initSentry = () => undefined;
        });

        waitFor(byProps("track", "trackMaker"), exports => {
            exports.track = () => Promise.resolve();
        });
    },
});
