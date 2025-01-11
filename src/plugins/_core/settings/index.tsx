import { t } from "../../../i18n";
import { findByName } from "../../../metro/api";
import { findAssetId } from "../../../metro/assets";
import { TableRow } from "../../../metro/common/components";
import { byProps } from "../../../metro/filters";
import { waitFor } from "../../../metro/internal/modules";
import { createContextualPatcher } from "../../../patcher/contextual";
import { findInReactTree } from "../../../utils/objects";
import { definePlugin, definePluginSettings } from "../../utils";
import { CustomPageRenderer } from "./CustomPageRenderer";
import SettingsManager from "./SettingsManager";
import WintryIcon from "./wintry.png";

const patcher = createContextualPatcher({ pluginName: "Settings" });

const SettingsOverviewScreen = findByName("SettingsOverviewScreen", false);

const settings = definePluginSettings({
    onTop: {
        type: "boolean",
        label: "On Top",
        description: "Show Wintry section on top",
        default: false,
    },
});

export default definePlugin("settings", {
    name: "Settings",
    description: "Provides a settings interface and debug information",
    authors: [{ name: "pylixonly" }],
    required: true,

    settings,

    manager: new SettingsManager(),

    start() {
        patcher.addDisposer(
            this.manager.registerSection({
                name: t.wintry(),
                items: [
                    {
                        key: "WINTRY",
                        title: () => t.wintry(),
                        IconComponent: () => <TableRow.Icon source={{ uri: WintryIcon }} />,
                        render: () => import("../../../components/WintrySettings/pages/Wintry"),
                    },
                    {
                        key: "WINTRY_PLUGINS",
                        title: () => t.settings.sections.plugins(),
                        IconComponent: () => <TableRow.Icon source={findAssetId("ActivitiesIcon")} />,
                        render: () => import("../../../components/WintrySettings/pages/Plugins"),
                    },
                    {
                        key: "WINTRY_DEVELOPER",
                        title: () => t.settings.sections.developer(),
                        IconComponent: () => <TableRow.Icon source={findAssetId("WrenchIcon")} />,
                        render: () => import("../../../components/WintrySettings/pages/Developer"),
                    },
                ],
            }),

            waitFor(byProps("SETTING_RENDERER_CONFIG"), settingConstants => {
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
                        ...this.manager.getRowConfigs(),
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

                for (const section of this.manager.registeredSections.values()) {
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
