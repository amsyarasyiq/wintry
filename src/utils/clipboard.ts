import { showToast } from "@api/toasts";
import { lookupByProps } from "@metro/new/common/wrappers";

let clipboard = lookupByProps("setString", "getString", "hasString").asLazy(m => (clipboard = m));

export async function copyToClipboard(text: string, { toast = true } = {}) {
    try {
        await clipboard.setString(text);
        if (toast)
            showToast({
                content: "Copied to clipboard",
            });
    } catch {
        if (toast)
            showToast({
                content: "Failed to copy to clipboard",
            });
    }
}
