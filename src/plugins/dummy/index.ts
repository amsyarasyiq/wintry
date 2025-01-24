import { definePlugin, definePluginSettings } from "#plugin-context";
import { Devs } from "../../data/constants";

const settings = definePluginSettings({
    bunnyName: {
        type: "string",
        label: "Bunny Name",
        description: "Name of the bunny.",
        placeholder: "Fluffy",
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
    }
});

export default definePlugin({
    name: "Dummy",
    description: "Does nothing!",
    authors: [Devs.Pylix],
    required: true,

    start() {
        console.log({
            settings
        })
    },
});