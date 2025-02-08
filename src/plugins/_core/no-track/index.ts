import { Devs } from "@data/constants";
import { byProps } from "@metro/filters";
import { waitFor } from "@metro/internal/modules";
import { definePlugin } from "#plugin-context";

export default definePlugin({
    name: "NoTrack",
    description: "Prevents Discord's tracking analytics and Sentry crash reporting",
    authors: [Devs.Pylix],
    required: true,

    preinit() {
        waitFor(byProps(["initSentry"]), exports => {
            exports.initSentry = () => undefined;
        });

        waitFor(byProps(["track", "trackMaker"]), exports => {
            exports.track = () => Promise.resolve();
        });
    },
});
