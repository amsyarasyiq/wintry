import PageWrapper from "@components/WintrySettings/PageWrapper";
import { t } from "@i18n";
import { TableRowGroup, TableRow, TableSwitchRow, Button } from "@metro/common";
import UpdaterModule from "@native/modules/UpdaterModule";
import { create } from "zustand";

interface UpdaterStore {
    autoUpdate: boolean;
    notify: boolean;
    isChecking: boolean;
    setAutoUpdate: (value: boolean) => void;
    setNotify: (value: boolean) => void;
    checkForUpdates: () => void;
}

export const useUpdaterStore = create<UpdaterStore>(set => ({
    autoUpdate: true,
    notify: true,
    isChecking: false,
    setAutoUpdate: value => set({ autoUpdate: value }),
    setNotify: value => set({ notify: value }),
    checkForUpdates: () => {
        set({ isChecking: true });
        UpdaterModule.updateBundle()
            .then(ret => {
                if (ret === true) {
                    alert("Updated successfully. Restart Discord to apply changes.");
                } else if (ret === false) {
                    alert("No updates available");
                } else {
                    alert("An error occurred. Please try again later.");
                }
            })
            .catch(() => {
                alert("An error occurred");
            })
            .finally(() => {
                set({ isChecking: false });
            });
    },
}));

const DUMMY_INFO = {
    commitHash: "1234567",
    branch: "main",
    discord: "765.32 (765432)",
    repo: "pylixonly/wintry",
};

export default function UpdaterPage() {
    const { autoUpdate, notify, isChecking, setAutoUpdate, setNotify, checkForUpdates } = useUpdaterStore();

    return (
        <PageWrapper style={{ paddingTop: 16, gap: 12 }}>
            <TableRowGroup title={t.settings.updater.info()}>
                <TableRow
                    label={t.wintry()}
                    trailing={<TableRow.TrailingText text={`${DUMMY_INFO.commitHash} (${DUMMY_INFO.branch})`} />}
                />
                <TableRow label={t.discord()} trailing={<TableRow.TrailingText text={DUMMY_INFO.discord} />} />
                <TableRow
                    label={t.settings.updater.repo()}
                    trailing={<TableRow.TrailingText text={DUMMY_INFO.repo} />}
                />
                <TableRow
                    label={
                        <Button
                            loading={isChecking}
                            text={t.settings.updater.checkForUpdates()}
                            onPress={() => {
                                checkForUpdates();
                            }}
                        />
                    }
                />
            </TableRowGroup>
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
