import { showToast } from "@api/toasts";
import { lookupByProps } from "@metro/common/wrappers";

let clipboard = lookupByProps("setString", "getString", "hasString").asLazy(m => (clipboard = m));

export async function copyToClipboard(text: string, { toast = true } = {}) {
    try {
        await clipboard.setString(text);
        if (toast)
            showToast({
                id: "wt-copied",
                text: "Copied to clipboard",
            });
    } catch {
        if (toast)
            showToast({
                id: "wt-failed-to-copy",
                text: "Failed to copy to clipboard",
            });
    }
}
