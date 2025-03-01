import { definePlugin, definePluginSettings, logger } from "#plugin-context";
import { Devs } from "@data/constants";
import BubbleModule from "@native/modules/BubbleModule";
import { shallow } from "zustand/shallow";

const settings = definePluginSettings({
    avatarRadius: {
        type: "slider",
        label: "Avatar Radius",
        points: [0, 3, 6, 9, 12, 15, 18],
        default: 12,
    },
    bubbleChatRadius: {
        type: "slider",
        label: "Bubble Radius",
        points: [0, 3, 6, 9, 12, 15, 18],
        default: 12,
    },
    bubbleChatColor: {
        type: "string",
        label: "Bubble Color",
        description: "The color of the chat bubble (in #RRGGBBAA format)",
        default: "#00000066",
        validate: value => /^#[0-9A-Fa-f]{8}$/.test(value),
    },
});

export default definePlugin({
    name: "ChatTweaks",
    description: "Tweaks the chat",
    authors: [Devs.Pylix],

    start() {
        BubbleModule.hookBubbles();

        settings.subscribe(
            s => [s.avatarRadius, s.bubbleChatRadius, s.bubbleChatColor] as const,
            (s: readonly [number, number, string]) => {
                BubbleModule.configure(...s).catch(logger.error);
            },
            {
                equalityFn: shallow,
                fireImmediately: true,
            },
        );
    },

    cleanup() {
        BubbleModule.unhookBubbles();
        settings.unsubscribeAll();
    },
});
