import type { AddonMetadata } from "@components/Wintry/Settings/pages/Addon";
import type { WintryTheme } from "./types";

export const ROSIE_PINK_THEME: WintryTheme = {
    id: "rosie.pink",
    type: "theme",
    display: {
        name: "Rosie Pink",
        description: "A cute pink theme for Discord.",
        authors: [{ name: "Rosie<3", id: "581573474296791211" }],
    },
    asAddonMetadata: (): AddonMetadata => {
        throw new Error("Function not implemented.");
    },
    main: {
        base: "dark",
        colors: {
            semantic: {
                CHAT_BACKGROUND: {
                    value: "$PRIMARY_600",
                },

                HEADER_PRIMARY: {
                    value: "#e792c5",
                },

                HEADER_SECONDARY: {
                    value: "$PRIMARY_300",
                },

                TEXT_NORMAL: {
                    value: "#fbfbfb",
                },

                TEXT_MUTED: {
                    value: "#e792c1",
                },

                INTERACTIVE_NORMAL: {
                    value: "$PRIMARY_300",
                },

                INTERACTIVE_HOVER: {
                    value: "#dedcde",
                },

                INTERACTIVE_ACTIVE: {
                    value: "$PRIMARY_200",
                },

                INTERACTIVE_MUTED: {
                    value: "#bf8ab0",
                },

                BACKGROUND_PRIMARY: {
                    value: "$PRIMARY_600",
                },

                CARD_PRIMARY_BG: {
                    value: "$PRIMARY_600",
                },

                BG_BASE_PRIMARY: {
                    value: "$PRIMARY_600",
                },

                BACKGROUND_SECONDARY: {
                    value: "#332831",
                },

                CARD_SECONDARY_BG: {
                    value: "#332831",
                },

                BG_BASE_SECONDARY: {
                    value: "#221b21",
                },

                BACKGROUND_SECONDARY_ALT: {
                    value: "#1f191d",
                },

                BACKGROUND_TERTIARY: {
                    value: "#282027",
                },

                BG_BASE_TERTIARY: {
                    value: "#282027",
                },

                BACKGROUND_ACCENT: {
                    value: "#ffb5f3",
                },

                BACKGROUND_FLOATING: {
                    value: "#292228",
                },

                BACKGROUND_MOBILE_PRIMARY: {
                    value: "#201820",
                },

                BACKGROUND_MOBILE_SECONDARY: {
                    value: "#2b232a",
                },

                BACKGROUND_NESTED_FLOATING: {
                    value: "#2d242c",
                },

                BACKGROUND_MESSAGE_HOVER: {
                    value: "$PRIMARY_200",
                    opacity: 0.02,
                },

                BACKGROUND_MODIFIER_HOVER: {
                    value: "$PRIMARY_200",
                    opacity: 0.02,
                },

                BACKGROUND_MODIFIER_ACTIVE: {
                    value: "$PRIMARY_200",
                    opacity: 0.08,
                },

                BACKGROUND_MODIFIER_SELECTED: {
                    value: "$PRIMARY_200",
                    opacity: 0.04,
                },

                BACKGROUND_MODIFIER_ACCENT: {
                    value: "#382e37",
                },

                BACKGROUND_MENTIONED: {
                    value: "#ff63b1",
                    opacity: 0.37,
                },

                BACKGROUND_MENTIONED_HOVER: {
                    value: "#ffabd5",
                    opacity: 0.5,
                },

                SCROLLBAR_THIN_THUMB: {
                    value: "#000",
                    opacity: 0,
                },

                SCROLLBAR_THIN_TRACK: {
                    value: "#000",
                    opacity: 0,
                },

                SCROLLBAR_AUTO_THUMB: {
                    value: "#000",
                    opacity: 0,
                },

                SCROLLBAR_AUTO_TRACK: {
                    value: "#000",
                    opacity: 0.1,
                },

                CHANNELTEXTAREA_BACKGROUND: {
                    value: "#111",
                },

                REDESIGN_ACTIVITY_CARD_BACKGROUND: {
                    value: "#30272e",
                },

                REDESIGN_ACTIVITY_CARD_BACKGROUND_PRESSED: {
                    value: "#685564",
                },

                CHANNELS_DEFAULT: {
                    value: "#b6b6b6",
                },

                TEXT_LINK: {
                    value: "#ffbaf2",
                },

                KEYBOARD: {
                    value: "$PRIMARY_800",
                },
            },

            raw: {
                PRIMARY_100: "#ffffff",
                PRIMARY_200: "#ffffff",
                PRIMARY_300: "#fffeff",
                PRIMARY_330: "#e7c6db",
                PRIMARY_360: "#fcfdfc",
                PRIMARY_400: "#e3bede",
                PRIMARY_460: "#493645",
                PRIMARY_500: "#e68cbf",
                PRIMARY_530: "#d46ea7",
                PRIMARY_600: "#2b2329",
                PRIMARY_630: "#30272f",
                PRIMARY_645: "#2a2229",
                PRIMARY_660: "#1a1419",
                PRIMARY_700: "#1a1419",
                PRIMARY_800: "#272027",
                BRAND_260: "#ff9ecb",
                BRAND_300: "#f598c3",
                BRAND_330: "#ed93bd",
                BRAND_345: "#e890b9",
                BRAND_360: "#e68eb7",
                BRAND_400: "#db88af",
                BRAND_430: "#d483a9",
                BRAND_460: "#cc7ea2",
                BRAND_500: "#c2789b",
                BRAND_530: "#ba7394",
                BRAND_560: "#b36f8e",
                BRAND_600: "#a86885",
                BRAND_630: "#a1647f",
                BRAND_660: "#995f79",
                BRAND_700: "#8f5971",
                RED_260: "#ff9ecb",
                RED_300: "#f598c3",
                RED_330: "#ed93bd",
                RED_345: "#e890b9",
                RED_360: "#e68eb7",
                RED_400: "#db88af",
                RED_430: "#d483a9",
                RED_460: "#cc7ea2",
                RED_500: "#c2789b",
                RED_530: "#ba7394",
                RED_560: "#b36f8e",
                RED_600: "#a86885",
                RED_630: "#a1647f",
                RED_660: "#995f79",
                RED_700: "#8f5971",
                ORANGE_260: "#ff9ecb",
                ORANGE_300: "#f598c3",
                ORANGE_330: "#ed93bd",
                ORANGE_345: "#e890b9",
                ORANGE_360: "#e68eb7",
                ORANGE_400: "#db88af",
                ORANGE_430: "#d483a9",
                ORANGE_460: "#cc7ea2",
                ORANGE_500: "#c2789b",
                ORANGE_530: "#ba7394",
                ORANGE_560: "#b36f8e",
                ORANGE_600: "#a86885",
                ORANGE_630: "#a1647f",
                ORANGE_660: "#995f79",
                ORANGE_700: "#8f5971",
                YELLOW_260: "#ff9ecb",
                YELLOW_300: "#f598c3",
                YELLOW_330: "#ed93bd",
                YELLOW_345: "#e890b9",
                YELLOW_360: "#e68eb7",
                YELLOW_400: "#db88af",
                YELLOW_430: "#d483a9",
                YELLOW_460: "#cc7ea2",
                YELLOW_500: "#c2789b",
                YELLOW_530: "#ba7394",
                YELLOW_560: "#b36f8e",
                YELLOW_600: "#a86885",
                YELLOW_630: "#a1647f",
                YELLOW_660: "#995f79",
                YELLOW_700: "#8f5971",
                GREEN_260: "#ff9ecb",
                GREEN_300: "#f598c3",
                GREEN_330: "#ed93bd",
                GREEN_345: "#e890b9",
                GREEN_360: "#e68eb7",
                GREEN_400: "#db88af",
                GREEN_430: "#d483a9",
                GREEN_460: "#cc7ea2",
                GREEN_500: "#c2789b",
                GREEN_530: "#ba7394",
                GREEN_560: "#b36f8e",
                GREEN_600: "#a86885",
                GREEN_630: "#a1647f",
                GREEN_660: "#995f79",
                GREEN_700: "#8f5971",
                BLUE_260: "#ff9ecb",
                BLUE_300: "#f598c3",
                BLUE_330: "#ed93bd",
                BLUE_345: "#e890b9",
                BLUE_360: "#e68eb7",
                BLUE_400: "#db88af",
                BLUE_430: "#d483a9",
                BLUE_460: "#cc7ea2",
                BLUE_500: "#c2789b",
                BLUE_530: "#ba7394",
                BLUE_560: "#b36f8e",
                BLUE_600: "#a86885",
                BLUE_630: "#a1647f",
                BLUE_660: "#995f79",
                BLUE_700: "#8f5971",
            },
        },
        background: {
            blur: 0.1,
            image: "https://media.discordapp.net/attachments/1026554757948637305/1042919699626852362/rosiepink.png",
            opacity: 1,
        },
    },
};
