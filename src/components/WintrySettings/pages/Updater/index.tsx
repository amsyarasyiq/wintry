import { useState } from "react";
import { t } from "@i18n";
import { Button, TableRow, TableRowGroup, TableSwitchRow } from "@metro/common";
import PageWrapper from "../../PageWrapper";

const DUMMY_INFO = {
    commitHash: "1234567",
    branch: "main",
    discord: "765.32 (765432)",
    repo: "pylixonly/wintry",
};

function useMockCheckForUpdates() {
    const [isChecking, setIsChecking] = useState(false);

    const checkForUpdates = () => {
        setIsChecking(true);
        setTimeout(() => {
            setIsChecking(false);

            if (Math.random() < 0.5) {
                alert("No updates available");
            } else {
                alert("Updates available");
            }
        }, 3000);
    };

    return { checkForUpdates, isChecking };
}

export default function UpdaterPage() {
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [notify, setNotify] = useState(true);
    const { isChecking, checkForUpdates } = useMockCheckForUpdates();

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
