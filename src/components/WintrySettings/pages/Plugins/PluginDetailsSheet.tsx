import { ActionSheet, Stack, TableRow, TableRowGroup, Text } from "../../../../metro/common";
import type { WintryPluginInstance } from "../../../../plugins/types";
import { t } from "../../../../i18n";
import { RNGHScrollView } from "./common";

interface PluginDetailsSheetProps {
    plugin: WintryPluginInstance;
}

export function PluginDetailsSheet({ plugin }: PluginDetailsSheetProps) {
    return (
        <ActionSheet>
            <Stack style={{ marginTop: 8 }} spacing={4} direction="horizontal">
                <Text variant="heading-lg/semibold">{plugin.name}</Text>
                <Text variant="heading-lg/semibold" color="text-muted">
                    ({plugin.id})
                </Text>
            </Stack>
            <RNGHScrollView contentContainerStyle={{ marginBottom: 12 }}>
                <TableRowGroup title={t.settings.plugins.info_sheet.details()}>
                    <TableRow label={t.settings.plugins.info_sheet.id()} subLabel={plugin.id} />
                    {/** TODO: Implement this */}
                    <TableRow label={t.settings.plugins.info_sheet.version()} subLabel={"<insert commit here>"} />
                    <TableRow
                        label={t.settings.plugins.info_sheet.authors()}
                        subLabel={plugin.authors.map(author => `${author.name} (${author.id})`).join(", ")}
                    />
                </TableRowGroup>
            </RNGHScrollView>
        </ActionSheet>
    );
}
