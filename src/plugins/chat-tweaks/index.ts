import { definePlugin, definePluginSettings } from "#plugin-context";
import { Devs } from "@data/constants";
import BubbleModule from "@native/modules/BubbleModule";
import { shallow } from "zustand/shallow";


const settings = definePluginSettings({
    avatarRadius: {
        type: "slider",
        label: "Avatar Radius",
        points: [0, 3, 6, 9, 12, 15, 18],
        default: 12
    },
    bubbleRadius: {
        type: "slider",
        label: "Bubble Radius",
        points: [0, 3, 6, 9, 12, 15, 18],
        default: 12
    },
});

export default definePlugin({
    name: "ChatTweaks",
    description: "Tweaks the chat",
    authors: [Devs.Pylix],

    start() {
        settings.subscribe(
            s => [s.avatarRadius, s.bubbleRadius],
            s => {
                const [avatarRadius, bubbleRadius] = s;
                BubbleModule.setRadius(Number(avatarRadius), Number(bubbleRadius));
            },
            { equalityFn: shallow }
        )
    },
});