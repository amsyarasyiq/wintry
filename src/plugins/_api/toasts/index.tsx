import { definePlugin } from "#plugin-context";
import { Devs } from "@data/constants";
import { byFilePath } from "@metro/common/filters";
import ToastContainer from "./components/ToastContainer";
import { useToastStore } from "@stores/useToastStore";

export default definePlugin({
    name: "Toasts",
    description: "Provides a toast notification API.",
    authors: [Devs.Pylix],
    required: true,

    patches: [
        {
            id: "add-toast-container",
            target: byFilePath("modules/toast/native/ToastContainer.tsx"),
            patch(module, patcher) {
                patcher.after(module, "type", (_, res) => {
                    const toasts = useToastStore(s => s.toasts);
                    if (!toasts.length) return res;

                    return (
                        <>
                            {res}
                            <ToastContainer />
                        </>
                    );
                });
            },
        },
    ],
});
