import { definePlugin } from "#plugin-context";
import { replyCommand } from "@api/commands/helpers";
import { patchCommands, registerCommand } from "@api/commands/index";
import { ApplicationCommandOptionType } from "@api/commands/types";
import { Devs } from "@data/constants";
import { getDebugInfo } from "@debug/info";
import { byProps } from "@metro/common/filters";
import { inspect } from "node-inspect-extracted";

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

                const lines = [
                    `> **Wintry** v${info.wintry.version} (${info.wintry.shortRevision}${info.wintry.branch !== "main" ? ` • ${info.wintry.branch}` : ""})`,
                    `> **Loader** ${info.loader.name} (v${info.loader.version})`,
                    `> **Discord** ${info.discord.version} (Build ${info.discord.build})`,
                    `> **React** ${info.react.version} / ${info.reactNative.branch}`,
                    `> **System** ${info.os.name} ${info.os.version}`,
                    `> **Device** ${info.device.model}${info.device.manufacturer ? ` (${info.device.manufacturer})` : ""}`,
                ];

                const subtextItems = [
                    `remote: ${info.wintry.remote}`,
                    `hermes bytecode: ${info.hermes.bytecodeVersion}`,
                    ...("sdk" in info.os ? [`sdk: ${info.os.sdk}`] : []),
                    `brand: ${info.device.brand}`,
                ];

                lines.push(`-# ${subtextItems.join(" • ")}`);

                const content = lines.join("\n");

                replyCommand(ctx.channel.id, { content }, !!ephemeral?.value);
            },
        });

        // TODO: Consider exposing this to normal users, under a hidden settings and with a warning
        if (__DEV__)
            registerCommand({
                name: "eval",
                description: "Evaluate JavaScript code",
                options: [
                    {
                        name: "code",
                        type: ApplicationCommandOptionType.STRING,
                        description: "The code to evaluate",
                        required: true,
                    },
                    {
                        name: "ephemeral",
                        type: ApplicationCommandOptionType.BOOLEAN,
                        description: "Whether to send the result as an ephemeral message",
                    },
                ],
                execute([code, ephemeral], ctx) {
                    try {
                        const res = global.eval?.(code.value);
                        const result =
                            typeof res === "string"
                                ? res
                                : inspect(res, {
                                      depth: 0,
                                  });

                        replyCommand(ctx.channel.id, { content: `\`\`\`js\n${result}\n\`\`\`` }, ephemeral?.value);
                    } catch (error) {
                        replyCommand(
                            ctx.channel.id,
                            {
                                content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                            },
                            ephemeral?.value,
                        );
                    }
                },
            });
    },
});
