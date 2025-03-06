import { TableRow, TableRowGroup, TableSwitchRow } from "@components/Discord";
import Button from "@components/Discord/Button/Button";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { t } from "@i18n";
import { getVersions } from "@debug/info";
import {} from "@components/Discord/AlertModal/AlertModal";
import { findAssetId } from "@api/assets";
import { View } from "react-native";
import {
    showAlreadyUpdatedToast,
    showUpdateAvailableAlert,
    showUpdateErrorAlert,
    useUpdaterStore,
} from "../../../../stores/useUpdaterStore";

export default function UpdaterPage() {
    const { bunny } = getVersions();
    const { autoUpdate, notify, isCheckingForUpdates, setAutoUpdate, setNotify, checkForUpdates } = useUpdaterStore();

    return (
        <PageWrapper style={{ paddingTop: 16, gap: 12 }}>
            <TableRowGroup title={t.settings.updater.info()}>
                <TableRow
                    label={t.wintry()}
                    icon={<TableRow.Icon source={require("@assets/ic_wintry.png")} />}
                    trailing={<TableRow.TrailingText text={`${bunny.shortRevision} (${bunny.branch})`} />}
                />
                <TableRow
                    label={t.settings.updater.repo()}
                    icon={<TableRow.Icon source={findAssetId("img_account_sync_github_light")} />}
                    trailing={<TableRow.TrailingText text={bunny.remote} />}
                />
            </TableRowGroup>
            <View style={{ width: "50%", alignSelf: "flex-end" }}>
                <Button
                    text={t.settings.updater.checkForUpdates()}
                    onPress={async () => {
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
                    }}
                    icon={findAssetId("DownloadIcon")}
                    disabled={isCheckingForUpdates}
                    loading={isCheckingForUpdates}
                />
            </View>
            <TableRowGroup title={t.settings.updater.settings()}>
                <TableSwitchRow
                    label={t.settings.updater.autoUpdate()}
                    subLabel={t.settings.updater.autoUpdateDescription()}
                    value={autoUpdate}
                    onValueChange={v => setAutoUpdate(v)}
                />
                <TableSwitchRow
                    label={t.settings.updater.notify()}
                    subLabel={t.settings.updater.notifyDescription()}
                    value={notify}
                    disabled={!autoUpdate}
                    onValueChange={v => setNotify(v)}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
