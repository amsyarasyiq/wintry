import { branch, commitHash } from "#build-info";
import { t } from "@i18n";
import { findAssetId } from "@metro";
import PageWrapper from "../../PageWrapper";
import { getVersions } from "@debug/info";
import { BundleUpdaterModule } from "@native";
import { TableRow, TableRowGroup } from "@components/Discord";

export default function WintryPage() {
    const versions = getVersions();

    return (
        <PageWrapper style={{ paddingTop: 16, gap: 12 }}>
            <TableRowGroup title={t.settings.general.info()}>
                <TableRow
                    label={t.wintry()}
                    icon={<TableRow.Icon source={require("@assets/wintry.png")} />}
                    trailing={<TableRow.TrailingText text={`${commitHash} (${branch})`} />}
                />
                <TableRow
                    label={t.discord()}
                    icon={<TableRow.Icon source={findAssetId("Discord")} />}
                    trailing={
                        <TableRow.TrailingText text={`${versions.discord.version} (${versions.discord.build})`} />
                    }
                />
            </TableRowGroup>
            <TableRowGroup title={t.settings.general.quick_actions()}>
                <TableRow
                    label={t.settings.general.reload()}
                    onPress={() => BundleUpdaterModule.reload()}
                    icon={<TableRow.Icon source={findAssetId("RetryIcon")} />}
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
