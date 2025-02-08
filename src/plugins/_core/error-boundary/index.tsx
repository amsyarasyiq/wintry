import { definePlugin } from "#plugin-context";
import { Devs } from "@data/constants";
import { byName } from "@metro/new/common/filters";
import { createContextualPatcher } from "@patcher/contextual";
import { ErrorBoundaryScreen } from "./ErrorBoundaryScreen";
import { lookup } from "@metro/new/api";

const patcher = createContextualPatcher({ pluginId: "error-boundary" });

export default definePlugin({
    name: "ErrorBoundary",
    description: "Error boundary for React components",
    authors: [Devs.Pylix],
    required: true,

    preinit() {
        const ErrorBoundaryPrototype = lookup(byName("ErrorBoundary"))
            .await()
            .then((m: any) => m.prototype);

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
