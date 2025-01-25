import { branch, commitHash } from "#build-info";
import { t } from "@i18n";
import { findAssetId } from "@metro";
import { TableRow, TableRowGroup } from "@metro/common/components";
import { NativeClientInfoModule } from "@native";
import WintryIcon from "@plugins/_core/settings/wintry.png";
import PageWrapper from "../../PageWrapper";

export default function WintryPage() {
    return (
        <PageWrapper style={{ paddingTop: 16 }}>
            <TableRowGroup title={t.settings.general.info()}>
                <TableRow
                    label={t.wintry()}
                    icon={<TableRow.Icon source={{ uri: WintryIcon }} />}
                    trailing={<TableRow.TrailingText text={`${commitHash} (${branch})`} />}
                />
                <TableRow
                    label={t.discord()}
                    icon={<TableRow.Icon source={findAssetId("Discord")} />}
                    trailing={
                        <TableRow.TrailingText
                            text={`${NativeClientInfoModule.Version} (${NativeClientInfoModule.Build})`}
                        />
                    }
                />
            </TableRowGroup>
        </PageWrapper>
    );
}
