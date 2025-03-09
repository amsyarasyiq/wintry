import { lazy } from "react";
import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import { TableCheckboxRow, TableRow, TableRowGroup, Text, TextInput } from "@components/Discord";
import PageWrapper from "../../PageWrapper";
import { NavigationNative } from "@metro/common/libraries";
import { MetroCache } from "@metro/internal/caches";
import { useInitConfigStore } from "@stores/useInitConfigStore";
import { useShallow } from "zustand/shallow";

export default function DeveloperPage() {
    const config = useInitConfigStore(useShallow(s => s.config));

    const navigation = NavigationNative.useNavigation();

    const tSections = t.settings.developer.sections;

    return (
        <PageWrapper scrollable={true} containerStyle={{ gap: 12 }}>
            <TableRowGroup title={tSections.init_config.label()}>
                <TableRow
                    label={
                        <TextInput
                            label={tSections.init_config.custom_endpoint()}
                            value={config.baseUrl}
                            placeholder="http://localhost:4040/"
                            onChange={v => useInitConfigStore.setState(s => ({ config: { ...s.config, baseUrl: v } }))}
                        />
                    }
                />
                <TableRow
                    label={
                        <TextInput
                            label={tSections.init_config.bundle_path()}
                            value={config.bundlePath || ""}
                            placeholder="bundle.js"
                            onChange={v =>
                                useInitConfigStore.setState(s => ({ config: { ...s.config, bundlePath: v || null } }))
                            }
                        />
                    }
                    subLabel={tSections.init_config.bundle_path_desc()}
                />
                <TableCheckboxRow
                    label={tSections.init_config.force_update()}
                    subLabel={tSections.init_config.force_update_desc()}
                    icon={<TableRow.Icon source={findAssetId("RefreshIcon")} />}
                    checked={config.forceUpdate}
                    onPress={() =>
                        useInitConfigStore.setState(s => ({
                            config: { ...s.config, forceUpdate: !s.config.forceUpdate },
                        }))
                    }
                />
            </TableRowGroup>
            <Text style={{ marginTop: -6 }} variant="text-xs/normal" color="text-muted">
                {tSections.init_config.sublabel()}
            </Text>
            <TableRowGroup title={tSections.tools.label()}>
                <TableRow
                    arrow={true}
                    label={tSections.tools.asset_browser.label()}
                    icon={<TableRow.Icon source={findAssetId("ImageIcon")} />}
                    onPress={() =>
                        navigation.push("WINTRY_CUSTOM_PAGE", {
                            title: tSections.tools.asset_browser.label(),
                            render: lazy(() => import("./AssetBrowser")),
                        })
                    }
                />
                <TableRow
                    arrow={true}
                    label={"Token Browser"}
                    icon={<TableRow.Icon source={findAssetId("PaintPaletteIcon")} />}
                    onPress={() =>
                        navigation.push("WINTRY_CUSTOM_PAGE", {
                            title: "Token Browser",
                            render: lazy(() => import("./TokenBrowser")),
                        })
                    }
                />
            </TableRowGroup>
            <TableRowGroup title={tSections.playground.label()}>
                <TableRow
                    arrow={true}
                    label={"Toasts"}
                    icon={<TableRow.Icon source={findAssetId("ChatWarningIcon")} />}
                    onPress={() =>
                        navigation.push("WINTRY_CUSTOM_PAGE", {
                            title: "Toast Playground",
                            render: lazy(() => import("./ToastPlayground")),
                        })
                    }
                />
                <TableRow
                    arrow={true}
                    label={"Callouts"}
                    icon={<TableRow.Icon source={findAssetId("WarningIcon")} />}
                    onPress={() =>
                        navigation.push("WINTRY_CUSTOM_PAGE", {
                            title: "Callouts Playground",
                            render: lazy(() => import("./CalloutPlayground")),
                        })
                    }
                />
                <TableRow
                    arrow={true}
                    label={"Alerts"}
                    icon={<TableRow.Icon source={findAssetId("WarningIcon")} />}
                    onPress={() =>
                        navigation.push("WINTRY_CUSTOM_PAGE", {
                            title: "Alerts Playground",
                            render: lazy(() => import("./AlertsPlayground")),
                        })
                    }
                />
            </TableRowGroup>
            <TableRowGroup title={tSections.actions.label()}>
                <TableRow
                    label={tSections.actions.invalidate_metro_cache()}
                    icon={<TableRow.Icon variant="danger" source={findAssetId("TrashIcon")} />}
                    variant="danger"
                    onPress={() => {
                        MetroCache.invalidate();
                        alert("Metro cache invalidated");
                    }}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
