import { definePlugin, definePluginSettings, logger } from "#plugin-context";
import { replyCommand } from "@api/commands/helpers";
import { ApplicationCommandOptionType } from "@api/commands/types";
import { Devs } from "@data/constants";
import { byProps } from "@metro/common/filters";
import { defineCommand } from "@api/commands/helpers";
import { delay } from "es-toolkit";

const settings = definePluginSettings({
    bunnyName: {
        type: "string",
        label: "Bunny Name",
        description: "Name of the bunny.",
        placeholder: "Fluffy",
        validate: (value: string) => {
            return Boolean(value.match(/^[a-zA-Z]+$/));
        },
    },
    winterCoat: {
        type: "boolean",
        label: "Winter Coat",
        description: "Does the bunny have a winter coat?",
        icon: "SnowflakeIcon",
    },
    favoriteSeason: {
        type: "select",
        label: "Favorite Season",
        description: "Select the bunny's favorite season.",
        options: [
            {
                label: "Spring",
                description: "The season of new beginnings.",
                value: "spring",
            },
            {
                label: "Summer",
                description: "The season of warmth and sunshine.",
                value: "summer",
            },
            {
                label: "Autumn",
                description: "The season of harvest and falling leaves.",
                value: "autumn",
            },
            {
                label: "Winter",
                description: "The season of snow and coziness.",
                value: "winter",
            },
        ],
    },
    hibernation: {
        type: "radio",
        label: "Hibernation",
        description: "Does the bunny hibernate during winter?",
        options: [
            {
                label: "Yes",
                description: "The bunny hibernates during winter.",
                value: "yes",
            },
            {
                label: "No",
                description: "The bunny stays active during winter.",
                value: "no",
            },
        ],
    },
    energyLevel: {
        type: "slider",
        label: "Energy Level",
        description: "Set the bunny's energy level.",
        points: ["0%", "25%", "50%", "75%", "100%"],
        default: "50%",
    },
});

if (__DEV__) {
    window.sampleMethod = () => {
        return "this method is unpatched";
    };
}

export default definePlugin({
    name: "Dummy",
    description: "Does literally nothing! Used for showcasing plugin APIs.",
    authors: [Devs.Pylix],

    isAvailable: () => __DEV__,

    commands: [
        defineCommand({
            name: "sample-command",
            description: "A sample command with options.",
            options: [
                {
                    name: "option1",
                    type: ApplicationCommandOptionType.STRING,
                    description: "A sample string option.",
                    required: true,
                },
                {
                    name: "option2",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    description: "A sample boolean option.",
                    required: false,
                },
            ],
            execute([option1, option2], ctx) {
                replyCommand(
                    ctx.channel.id,
                    {
                        content: `You provided option1: ${option1.value}, option2: ${option2?.value}`,
                    },
                    true,
                );
            },
        }),
    ],

    patches: [
        {
            id: "sample-patch",
            predicate: () => settings.get().winterCoat === true,
            target: byProps(["toString"]), // This matches almost all modules lol
            patch(_, patcher) {
                patcher.after(window, "sampleMethod", () => {
                    return "this method is patched";
                });
            },
        },
    ],

    async start() {
        await delay(1000);

        settings.set({
            bunnyName: "Fluffier",
            winterCoat: false,
        });

        settings.set(prevState => {
            logger.inspect({ prevState });
            return {
                favoriteSeason: ["spring"],
                hibernation: "no",
                energyLevel: "75%",
            };
        });
    },
});
