import { definePlugin, meta } from "#plugin-context";
import { Devs } from "@data/constants";
import { findByFilePath } from "@metro";
import { createContextualPatcher } from "@patcher/contextual";
import { ToastsRenderer } from "./ToastsRenderer";

const patcher = createContextualPatcher({ pluginId: meta.id });

const ToastContainer = findByFilePath("modules/toast/native/ToastContainer.tsx", true);

export default definePlugin({
    name: "Toasts",
    description: "Provides a toast notification API.",
    authors: [Devs.Pylix],
    required: true,

    start() {
        patcher.after(ToastContainer, "type", (_, res) => {
            return (
                <>
                    {res}
                    <ToastsRenderer />
                </>
            );
        });
    },
});
