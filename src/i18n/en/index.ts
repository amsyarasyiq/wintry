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
    error_boundary: {
        uh_oh: "Uh oh.",
        retry_render: "Retry Render",
        reload: "Reload Discord",
        safe_mode: "Safe Mode",
        screen: {
            copy: "Copy",
            show_more: "Show more",
            show_less: "Show less",
            component_stack: "Component Stack",
            call_stack: "Call Stack",
            description: "An error occurred while rendering a component. This may have been caused by a plugin, Wintry, or Discord itself.",
        }
    },
    settings: {
        sections: {
            plugins: "Plugins",
            themes: "Themes",
            developer: "Developer",
            updater: "Updater",
        },
        general: {
            info: "Info",
            quick_actions: "Quick Actions",
            reload: "Reload Discord"
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
                path: "Path",
            }
        },
        developer: {
            assetBrowser: "Asset Browser",
            sections: {
                tools: "Tools",
                data: "Data",
                invalidate_metro_cache: "Invalidate Metro Cache",
            },
        },
        updater: {
            info: "Info",
            repo: "Repository",
            settings: "Settings",
            autoUpdate: "Automatic Updates",
            autoUpdateDescription: "Enable automatic Wintry updates without prompts",
            notify: "Notify After Update",
            notifyDescription: "Display a message once Wintry is auto-updated",
            checkForUpdates: "Check for Updates",
        }
    },
} satisfies BaseTranslation;

export default en;
