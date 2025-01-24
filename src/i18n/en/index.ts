import type { BaseTranslation } from "../i18n-types.js";

const en = {
    discord: "Discord",
    wintry: "Wintry",
    ui: {
        components: {
            search: {
                placeholder: "Search",
            },
        },
    },
    settings: {
        sections: {
            plugins: "Plugins",
            themes: "Themes",
            developer: "Developer",
        },
        general: {
            info: "Info",
        },
        plugins: {
            description: "Description",
            info_sheet: {
                details: "Details",
                more_info: "More Info",
                view_source: "View Source",
                configurations: "Configurations",
                authors: "Authors",
                version: "Version",
                id: "ID",
            }
        },
        developer: {
            assetBrowser: "Asset Browser",
            sections: {
                tools: "Tools",
            },
        },
    },
} satisfies BaseTranslation;

export default en;
