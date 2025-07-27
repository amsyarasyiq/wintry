import { definePlugin, definePluginSettings } from "#plugin-context";
import { showToast } from "@api/toasts";
import { Devs } from "@data/constants";

// TODO: Remove this once the silent typing plugin is fully implemented
const toast = showToast("you are typing rn...").hide();

const settings = definePluginSettings({
    silentTypingActive: {
        label: "Silent Typing",
        description:
            "Turn on to hide your typing status. This setting syncs with the /silent-typing command for easy toggle.",
        type: "boolean",
        default: true,
    },
});

// TODO: Easy toggle with command to enable/disable silent typing
export default definePlugin({
    name: "SilentTyping",
    description: "Conceal your typing status to ensure your activity remains private while writing messages.",
    authors: [Devs.Pylix],

    flux: {
        TYPING_START_LOCAL: () => {
            if (settings.get().silentTypingActive) return false;

            toast.show();
        },
    },
});
