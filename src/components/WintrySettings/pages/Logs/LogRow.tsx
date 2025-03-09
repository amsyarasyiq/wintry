import { Text } from "@components/Discord";
import PressableScale from "@components/Discord/experimental/PressableScale";
import { showSheet } from "@components/utils/sheets";
import { useToken, tokens } from "@metro/common/libraries";
import { View } from "react-native";
import { LogDetailsSheet } from "./LogDetailsSheet";
import { type Log, VARIANT_CONFIG, LOG_HISTORY_MOCK } from ".";

export function LogRow({ item: log, index }: { item: Log; index: number }) {
    const variantStyles = VARIANT_CONFIG[log.level];
    const backgroundColor = useToken(tokens.colors[variantStyles.background]);
    const isFirst = index === 0;
    const isLast = index === LOG_HISTORY_MOCK.length - 1;

    const handlePress = () => {
        showSheet("Log Details", LogDetailsSheet, { log });
    };

    return (
        <View
            style={{
                gap: 2,
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor,
                ...(isFirst
                    ? { borderTopLeftRadius: 12, borderTopRightRadius: 12 }
                    : isLast
                      ? { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }
                      : {}),
            }}
        >
            <PressableScale onPress={handlePress}>
                <Text variant="text-xxs/semibold" color={variantStyles.timestampColor}>
                    {log.level.toUpperCase()} | {new Date(log.timestamp).toLocaleString()}
                </Text>

                {log.breadcrumbs?.length !== 0 && (
                    <Text style={{ paddingBottom: 4 }} variant="text-xs/semibold" color={variantStyles.timestampColor}>
                        {log.breadcrumbs!.join(" > ")}
                    </Text>
                )}

                <Text numberOfLines={6} variant="text-sm/semibold" color={variantStyles.textColor}>
                    {log.message}
                </Text>
            </PressableScale>
        </View>
    );
}
