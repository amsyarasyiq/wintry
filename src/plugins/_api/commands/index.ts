import { definePlugin } from "#plugin-context";
import { patchCommands, registerCommand } from "@api/commands/index";
import { ApplicationCommandOptionType } from "@api/commands/types";
import { Devs } from "@data/constants";
import { getDebugInfo } from "@debug/info";
import { byProps } from "@metro/common/filters";

export default definePlugin({
    name: "Commands",
    description: "Provides an API to register and manage commands.",
    authors: [Devs.Pylix],

    required: true,

    patches: [
        {
            id: "commands",
            target: byProps(["getBuiltInCommands"]),
            patch(module, patcher) {
                const unpatch = patchCommands(module);
                patcher.attachDisposer(unpatch);
            },
        },
    ],

    start() {
        registerCommand({
            name: "debug",
            description: "Get debug information about Wintry and the current environment",
            options: [
                {
                    name: "ephemeral",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    description: "Whether to send the debug info as an ephemeral message",
                },
            ],
            execute([ephemeral], ctx) {
                const info = getDebugInfo();
                const content = [
                    "**Wintry Debug Info**",
                    `> Wintry: ${info.bunny.version} (${info.bunny.version} ${info.bunny.shortRevision})`,
                    `> Discord: ${info.discord.version} (${info.discord.build})`,
                    `> React: ${info.react.version} (RN ${info.reactNative.version})`,
                    `> Hermes: ${info.hermes.buildType} (bcv${info.hermes.bytecodeVersion})`,
                    `> System: ${info.os.name} ${info.os.version}}`.trimEnd(),
                    `> Device: ${info.device.model} (${info.device.model})`,
                ].join("\n");

                return { content };
            },
        });
    },
});
