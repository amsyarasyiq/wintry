import { definePlugin, logger, patcher } from "#plugin-context";
import { Devs } from "@data/constants";
import { byName } from "@metro/common/filters";
import { ErrorBoundaryScreen } from "./ErrorBoundaryScreen";
import { lookupByProps } from "@metro/common/wrappers";

export default definePlugin({
    name: "ErrorBoundary",
    description: "Error boundary for React components",
    authors: [Devs.Pylix],
    required: true,

    patches: [
        {
            id: "error-boundary",
            target: byName("ErrorBoundary"),
            patch(module, patcher) {
                patcher.after(module.prototype, "render", function (this: any) {
                    const {
                        state: { error },
                    } = this;

                    if (!error) return null;

                    logger.error(error.stack);

                    const reset = this.setState.bind(this, { error: null });
                    return <ErrorBoundaryScreen error={error} reset={reset} />;
                });
            },
        },
    ],

    start() {
        const jsxRuntime = lookupByProps("jsx", "jsxs").await();
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
