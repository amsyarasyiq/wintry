import { definePlugin, meta } from "#plugin-context";
import { Devs } from "@data/constants";
import { byName } from "@metro/common/filters";
import { createContextualPatcher } from "@patcher/contextual";
import { ErrorBoundaryScreen } from "./ErrorBoundaryScreen";
import { lookup } from "@metro/api";
import { wtlogger } from "@api/logger";
import { lookupByProps } from "@metro/common/wrappers";

const patcher = createContextualPatcher({ pluginId: meta.id });

export default definePlugin({
    name: "ErrorBoundary",
    description: "Error boundary for React components",
    authors: [Devs.Pylix],
    required: true,

    start() {
        const ErrorBoundaryPrototype = lookup(byName("ErrorBoundary"))
            .await()
            .then((m: any) => m.prototype);

        const jsxRuntime = lookupByProps("jsx", "jsxs").await();

        patcher.after.async(ErrorBoundaryPrototype, "render", function (this: any) {
            const {
                state: { error },
            } = this;

            if (!error) return null;

            wtlogger.error(error.stack);
            const reset = this.setState.bind(this, { error: null });
            return <ErrorBoundaryScreen error={error} reset={reset} />;
        });

        const callback = (args: any[]) => {
            if (!args[0])
                throw new Error(
                    "The first argument (Component) is falsy. Ensure that you are passing a valid component.",
                );
        };

        // TODO: since this patch is added, perhaps rename the plugin
        patcher.after.async(jsxRuntime, "jsx", callback);
        patcher.after.async(jsxRuntime, "jsxs", callback);
    },
});
