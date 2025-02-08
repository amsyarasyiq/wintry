import { definePlugin } from "#plugin-context";
import { Devs } from "@data/constants";
import { findAsync } from "@metro";
import { byName } from "@metro/filters";
import { createContextualPatcher } from "@patcher/contextual";
import { ErrorBoundaryScreen } from "./ErrorBoundaryScreen";

const patcher = createContextualPatcher({ pluginId: "error-boundary" });

export default definePlugin({
    name: "ErrorBoundary",
    description: "Error boundary for React components",
    authors: [Devs.Pylix],
    required: true,

    preinit() {
        const ErrorBoundaryPrototype = findAsync(byName("ErrorBoundary")).then((m: any) => m.prototype);

        patcher.after.async(ErrorBoundaryPrototype, "render", function (this: any) {
            const {
                state: { error },
            } = this;

            if (!error) return null;

            console.error(error.stack);
            const reset = this.setState.bind(this, { error: null });
            return <ErrorBoundaryScreen error={error} reset={reset} />;
        });
    },
});
