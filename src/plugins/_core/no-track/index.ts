import { byProps } from "../../../metro/filters";
import { waitFor } from "../../../metro/internal/modules";
import { definePlugin } from "../../types";

export default definePlugin({
    name: "NoTrack",
    description: "Disables tracking",
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
