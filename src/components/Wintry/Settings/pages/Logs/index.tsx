import TableRowDivider from "@components/Discord/TableRow/TableRowDivider";
import PageWrapper from "@components/Wintry/Settings/PageWrapper";
import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { InlineCheckbox } from "../../InlineCheckbox";
import { LogRow } from "./LogRow";
import { wtlogger } from "@api/logger";

export default function LogsPage() {
    const [showDebug, setShowDebug] = useState(false);

    const filteredLogs = useMemo(() => {
        return wtlogger.logs.filter(log => log.level !== "debug" || showDebug);
    }, [showDebug]);

    return (
        <PageWrapper>
            <FlashList
                data={filteredLogs}
                ListHeaderComponent={
                    <ScrollView contentContainerStyle={{ gap: 12, paddingVertical: 12 }} horizontal={true}>
                        <InlineCheckbox label="Show debug" checked={showDebug} onPress={() => setShowDebug(v => !v)} />
                    </ScrollView>
                }
                ItemSeparatorComponent={TableRowDivider}
                renderItem={({ item, index }) => (
                    <LogRow item={item} start={index === 0} end={index === filteredLogs.length - 1} />
                )}
                estimatedItemSize={80}
            />
        </PageWrapper>
    );
}
