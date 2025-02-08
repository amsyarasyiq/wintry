import { Devs } from "@data/constants";
import { t } from "@i18n";
import { findAssetId } from "@metro/assets";
import { TableRow } from "@metro/common/components";
import { byName, byProps } from "@metro/filters";
import { waitFor } from "@metro/internal/modules";
import { createContextualPatcher } from "@patcher/contextual";
import { findInReactTree } from "@utils/objects";
import { CustomPageRenderer } from "./CustomPageRenderer";
import { definePlugin, definePluginSettings, meta } from "#plugin-context";
import SettingsManager from "./SettingsManager";
import { lookup } from "@metro/new/api";

const patcher = createContextualPatcher({ pluginId: meta.id });

const SettingsOverviewScreen = lookup(byName("SettingsOverviewScreen", { returnEsmDefault: false })).asLazy();

const manager = new SettingsManager();

const settings = definePluginSettings({
    onTop: {
        type: "boolean",
        label: "On Top",
        description: "Show Wintry section on top",
        default: false,
    },
});

export default definePlugin({
    name: "Settings",
    description: "Provides a settings interface and debug information",
    authors: [Devs.Pylix],
    required: true,

    start() {
        patcher.addDisposer(
            manager.registerSection({
                name: t.wintry(),
                items: [
                    {
                        key: "WINTRY",
                        title: () => t.wintry(),
                        IconComponent: () => <TableRow.Icon source={require("@assets/wintry.png")} />,
                        render: () => import("@components/WintrySettings/pages/Wintry"),
                    },
                    {
                        key: "WINTRY_PLUGINS",
                        title: () => t.settings.sections.plugins(),
                        IconComponent: () => <TableRow.Icon source={findAssetId("ActivitiesIcon")} />,
                        render: () => import("@components/WintrySettings/pages/Plugins"),
                    },
                    {
                        key: "WINTRY_DEVELOPER",
                        title: () => t.settings.sections.developer(),
                        IconComponent: () => <TableRow.Icon source={findAssetId("WrenchIcon")} />,
                        render: () => import("@components/WintrySettings/pages/Developer"),
                    },
                    {
                        key: "WINTRY_UPDATER",
                        title: () => t.settings.sections.updater(),
                        IconComponent: () => <TableRow.Icon source={findAssetId("DownloadIcon")} />,
                        render: () => import("@components/WintrySettings/pages/Updater"),
                    },
                ],
            }),

            waitFor(byProps(["SETTING_RENDERER_CONFIG"]), settingConstants => {
                const origRendererConfig = settingConstants.SETTING_RENDERER_CONFIG;
                let rendererConfigValue = settingConstants.SETTING_RENDERER_CONFIG;

                Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
                    enumerable: true,
                    configurable: true,
                    get: () => ({
                        ...rendererConfigValue,

                        // Render "custom" Bunny page
                        BUNNY_CUSTOM_PAGE: {
                            type: "route",
                            title: () => "Bunny",
                            screen: {
                                route: "BUNNY_CUSTOM_PAGE",
                                getComponent: () => CustomPageRenderer,
                            },
                        },

                        // Render other sections
                        ...manager.getRowConfigs(),
                    }),
                    set: v => (rendererConfigValue = v),
                });

                patcher.addDisposer(() => {
                    Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
                        value: origRendererConfig,
                        writable: true,
                        get: undefined,
                        set: undefined,
                    });
                });
            }),

            patcher.after(SettingsOverviewScreen, "default", (_, ret) => {
                const { sections } = findInReactTree(ret, i => i.props?.sections).props;
                let index = settings.get().onTop
                    ? 0
                    : -~sections.findIndex((sect: any) => sect.settings.includes("ACCOUNT")) || 1;

                for (const section of manager.registeredSections.values()) {
                    sections.splice(index++, 0, {
                        label: section.name,
                        settings: section.items.map(a => a.key),
                    });
                }
            }),
        );
    },

    cleanup() {
        patcher.dispose();
    },
});
