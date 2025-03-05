import { t } from "@i18n";
import { findAssetId } from "@api/assets";
import { getVersions } from "@debug/info";
import { BottomSheet, TableRow, TableRowGroup } from "@components/Discord";

export function ClientInfoSheet() {
    const { discord, react, reactNative, hermes } = getVersions();

    return (
        <BottomSheet bodyStyles={{ padding: 12 }}>
            <TableRowGroup title={t.settings.general.client_info.label()}>
                <TableRow
                    label={t.discord()}
                    icon={<TableRow.Icon source={findAssetId("Discord")} />}
                    trailing={<TableRow.TrailingText text={`${discord.version} (${discord.build})`} />}
                />
                <TableRow
                    label={t.settings.general.react()}
                    icon={<TableRow.Icon source={findAssetId("ScienceIcon")} />}
                    trailing={<TableRow.TrailingText text={react.version} />}
                />
                <TableRow
                    label={t.settings.general.react_native()}
                    icon={<TableRow.Icon source={findAssetId("ScienceIcon")} />}
                    trailing={<TableRow.TrailingText text={`${reactNative.version} (${reactNative.branch})`} />}
                />
                <TableRow
                    label={t.settings.general.hermes()}
                    icon={<TableRow.Icon source={findAssetId("PollsIcon")} />}
                    trailing={<TableRow.TrailingText text={hermes.bytecodeVersion} />}
                />
            </TableRowGroup>
        </BottomSheet>
    );
}
