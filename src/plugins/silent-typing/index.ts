import { definePlugin, definePluginSettings } from "#plugin-context";
import { defineCommand, replyCommand } from "@api/commands/helpers";
import { ApplicationCommandOptionType } from "@api/commands/types";
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

export default definePlugin({
    name: "SilentTyping",
    description: "Conceal your typing status to ensure your activity remains private while writing messages.",
    authors: [Devs.Pylix],

    commands: [
        defineCommand({
            name: "silent-typing",
            description: "Toggle silent typing mode.",
            options: [
                {
                    name: "enable",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    description: "Enable or disable silent typing mode.",
                    required: true,
                },
            ],
            execute([enable], ctx) {
                settings.set(() => ({ silentTypingActive: enable?.value }));

                replyCommand(ctx.channel.id, {
                    content: `Silent typing mode is now ${settings.get().silentTypingActive ? "enabled" : "disabled"}.`,
                });
            },
        }),
    ],

    flux: {
        TYPING_START_LOCAL: () => {
            if (settings.get().silentTypingActive) return false;

            toast.show();
        },
    },
});
