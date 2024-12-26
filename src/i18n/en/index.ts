import type { BaseTranslation } from "../i18n-types.js";

const en = {
    wintry: "Wintry",
    ui: {
        components: {
            search: {
                placeholder: "Search"
            }
        }
    },
    settings: {
        sections: {
            plugins: "Plugins",
            themes: "Themes",
            developer: "Developer"
        },
        developer: {
            assetBrowser: "Asset Browser",
            sections: {
                tools: "Tools"
            }
        }
    },
} satisfies BaseTranslation;

export default en;
