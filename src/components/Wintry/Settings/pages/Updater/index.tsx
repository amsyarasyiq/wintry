import { TableRow, TableRowGroup, TableSwitchRow } from "@components/Discord";
import Button from "@components/Discord/Button/Button";
import PageWrapper from "@components/Wintry/Settings/PageWrapper";
import { t } from "@i18n";
import { getVersions } from "@debug/info";
import { findAssetId } from "@api/assets";
import { View } from "react-native";
import {
    showAlreadyUpdatedToast,
    showUpdateAvailableAlert,
    showUpdateErrorAlert,
    useUpdaterStore,
} from "@stores/useUpdaterStore";
import { useInitConfigStore } from "@stores/useInitConfigStore";
import { useEffect } from "react";

export default function UpdaterPage() {
    const { wintry } = getVersions();
    const { isCheckingForUpdates, notifyOnNewUpdate, checkForUpdates } = useUpdaterStore();
    const { config } = useInitConfigStore();

    const check = async () => {
        try {
            const updateAvailable = await checkForUpdates();
            if (updateAvailable) {
                showUpdateAvailableAlert(updateAvailable);
            } else {
                showAlreadyUpdatedToast();
            }
        } catch (e) {
            showUpdateErrorAlert(e);
        }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: idc
    useEffect(() => void check(), []);

    return (
        <PageWrapper scrollable={true} containerStyle={{ paddingTop: 16, gap: 12 }}>
            <TableRowGroup title={t.settings.updater.info()}>
                <TableRow
                    label={t.wintry()}
                    icon={<TableRow.Icon source={require("@assets/ic_wintry.png")} />}
                    trailing={
                        <TableRow.TrailingText text={`${wintry.version}-${wintry.shortRevision} (${wintry.branch})`} />
                    }
                />
                <TableRow
                    label={t.settings.updater.repo()}
                    icon={<TableRow.Icon source={findAssetId("img_account_sync_github_light")} />}
                    trailing={<TableRow.TrailingText text={wintry.remote} />}
                />
            </TableRowGroup>
            <View style={{ flexShrink: 1, alignSelf: "flex-end" }}>
                <Button
                    text={t.settings.updater.checkForUpdates()}
                    onPress={check}
                    icon={findAssetId("DownloadIcon")}
                    disabled={isCheckingForUpdates}
                    loading={isCheckingForUpdates}
                />
            </View>
            <TableRowGroup title={t.settings.updater.settings()}>
                <TableSwitchRow
                    label={t.settings.updater.autoUpdate()}
                    subLabel={t.settings.updater.autoUpdateDescription()}
                    value={!config.skipUpdate}
                    onValueChange={v => useInitConfigStore.setState(s => ({ config: { ...s.config, skipUpdate: !v } }))}
                />
                <TableSwitchRow
                    label={t.settings.updater.notifyNewUpdates()}
                    subLabel={t.settings.updater.notifyNewUpdatesDescription()}
                    disabled={!config.skipUpdate}
                    value={notifyOnNewUpdate && config.skipUpdate}
                    onValueChange={v => useUpdaterStore.setState({ notifyOnNewUpdate: v })}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
