import { showToast } from "@api/toasts";
import { findByProps } from "@metro";

const clipboard = findByProps("setString", "getString", "hasString");

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
