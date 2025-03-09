import Codeblock from "@components/Codeblock";
import { BottomSheet, Button, Stack, Text } from "@components/Discord";
import ErrorCard from "@components/ErrorCard";
import { useToken, tokens } from "@metro/common/libraries";
import { View } from "react-native";
import { InfoSection } from "../InfoSection";
import { copyToClipboard } from "@utils/clipboard";
import { t } from "@i18n";
import { type Log, VARIANT_CONFIG } from ".";

export function LogDetailsSheet({ log }: { log: Log }) {
    const variantStyles = VARIANT_CONFIG[log.level];
    const backgroundColor = useToken(tokens.colors[variantStyles.background]);

    return (
        <BottomSheet>
            <View style={{ padding: 16, gap: 16 }}>
                <Stack
                    direction="horizontal"
                    align="center"
                    justify="space-between"
                    style={{
                        padding: 12,
                        paddingHorizontal: 16,
                        backgroundColor,
                        borderRadius: 16,
                    }}
                >
                    <View style={{ gap: 4 }}>
                        <Text variant="text-lg/semibold" color={variantStyles.textColor}>
                            {log.level.toUpperCase()}
                        </Text>
                        <Text variant="text-xs/semibold" color={variantStyles.textColor}>
                            {new Date(log.timestamp).toLocaleString()}
                        </Text>
                    </View>
                    <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => copyToClipboard(log.message)}
                        text={t.actions.copy()}
                    />
                </Stack>

                <InfoSection label="Message">
                    <Codeblock>{log.message}</Codeblock>
                </InfoSection>

                {log.error && (
                    <InfoSection label="Error">
                        <ErrorCard header={null} showStackTrace={true} error={log.error} />
                    </InfoSection>
                )}
            </View>
        </BottomSheet>
    );
}
