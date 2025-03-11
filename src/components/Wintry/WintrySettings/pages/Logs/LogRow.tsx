import { Text } from "@components/Discord";
import PressableScale from "@components/Discord/experimental/PressableScale";
import { showSheet } from "@components/utils/sheets";
import { useToken, tokens } from "@metro/common/libraries";
import { View } from "react-native";
import { LogDetailsSheet } from "./LogDetailsSheet";
import { VARIANT_CONFIG } from "./constants";
import type { LogDetails } from "@api/logger";

export function LogRow({ item: log, start, end }: { item: LogDetails; start: boolean; end: boolean }) {
    const variantStyles = VARIANT_CONFIG[log.level];
    const backgroundColor = useToken(tokens.colors[variantStyles.background]);

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
                ...(start
                    ? { borderTopLeftRadius: 12, borderTopRightRadius: 12 }
                    : end
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
