import { definePlugin, meta } from "#plugin-context";
import { Devs } from "@data/constants";
import { createContextualPatcher } from "@patcher/contextual";
import { ToastsRenderer } from "./ToastsRenderer";
import { useToastStore } from "@stores/useToastStore";
import { lookup } from "@metro/new/api";
import { byFilePath } from "@metro/new/common/filters";

const patcher = createContextualPatcher({ pluginId: meta.id });

const ToastContainer = lookup(byFilePath("modules/toast/native/ToastContainer.tsx")).asLazy();

export default definePlugin({
    name: "Toasts",
    description: "Provides a toast notification API.",
    authors: [Devs.Pylix],
    required: true,

    start() {
        patcher.after(ToastContainer, "type", (_, res) => {
            const toasts = useToastStore(s => s.toasts);
            if (!toasts.length) return res;

            return (
                <>
                    {res}
                    <ToastsRenderer />
                </>
            );
        });
    },
});
