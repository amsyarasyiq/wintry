import Codeblock from "@components/Wintry/Codeblock";
import { BottomSheet, Button, Stack, Text } from "@components/Discord";
import { useToken, tokens } from "@metro/common/libraries";
import { View } from "react-native";
import { InfoSection } from "../InfoSection";
import { copyToClipboard } from "@utils/clipboard";
import { t } from "@i18n";
import { VARIANT_CONFIG } from "./constants";
import type { LogDetails } from "@api/logger";

export function LogDetailsSheet({ log }: { log: LogDetails }) {
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
                        onPress={() => {
                            let toCopy = `${log.level.toUpperCase()} | ${new Date(log.timestamp).toLocaleString()}\n${log.message}`;
                            if (log.breadcrumbs?.length) {
                                toCopy += `\n${log.breadcrumbs.join(" > ")}`;
                            }
                            if (log.errorStack) {
                                toCopy += `\n${log.errorStack}`;
                            }

                            copyToClipboard(toCopy);
                        }}
                        text={t.actions.copy()}
                    />
                </Stack>

                <InfoSection label="Message">
                    <Codeblock>{log.message}</Codeblock>
                </InfoSection>

                {log.errorStack && (
                    <InfoSection label="Error">
                        <Codeblock selectable={true}>{log.errorStack}</Codeblock>
                    </InfoSection>
                )}
            </View>
        </BottomSheet>
    );
}
