import type { WintryPluginInstance } from "@plugins/types";
import { t } from "@i18n";
import { RNGHScrollView } from "./common";
import { Stack, TableRow, TableRowGroup, Text } from "@components/Discord";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";

interface PluginDetailsSheetProps {
    plugin: WintryPluginInstance;
}

export function PluginDetailsSheet({ plugin }: PluginDetailsSheetProps) {
    return (
        <BottomSheet bodyStyles={{ gap: 12 }} contentStyles={{ paddingHorizontal: 16 }}>
            <Stack
                style={{ marginTop: 8, flexWrap: "nowrap" }}
                spacing={8}
                justify="center"
                align="center"
                direction="horizontal"
            >
                <Text variant="heading-xl/semibold">{plugin.name}</Text>
                <Text variant="heading-sm/semibold" color="text-muted">
                    ({plugin.$id})
                </Text>
            </Stack>
            <RNGHScrollView contentContainerStyle={{ marginBottom: 12 }}>
                <TableRowGroup title={t.settings.plugins.info_sheet.details()}>
                    <TableRow
                        label={t.settings.plugins.info_sheet.id()}
                        trailing={<TableRow.TrailingText text={plugin.$id} />}
                    />
                    {/** TODO: Implement this */}
                    <TableRow
                        label={t.settings.plugins.info_sheet.version()}
                        trailing={<TableRow.TrailingText text={"<insert version here>"} />}
                    />
                    <TableRow
                        label={t.settings.plugins.info_sheet.authors()}
                        trailing={
                            <TableRow.TrailingText
                                text={plugin.authors.map(author => `${author.name} (${author.id})`).join(", ")}
                            />
                        }
                    />
                    <TableRow
                        label={t.settings.plugins.info_sheet.path()}
                        trailing={<TableRow.TrailingText text={plugin.$path} />}
                    />
                </TableRowGroup>
            </RNGHScrollView>
        </BottomSheet>
    );
}
