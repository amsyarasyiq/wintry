import Codeblock from "@components/Codeblock";
import { BottomSheet, Text } from "@components/Discord";
import FormCheckbox from "@components/Discord/Forms/FormCheckbox";
import TableRowDivider from "@components/Discord/TableRow/TableRowDivider";
import PressableScale from "@components/Discord/experimental/PressableScale";
import ErrorCard from "@components/ErrorCard";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { showSheet } from "@components/utils/sheets";
import { useToken, tokens } from "@metro/common/libraries";
import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

interface Log {
    level: "info" | "warn" | "error" | "debug";
    message: string;
    timestamp: number;
    error?: Error;
    breadcrumbs?: Array<string>;
}

// TODO: Make this a shared component
function InlineCheckbox({
    label,
    checked,
    onPress,
}: { label: string; checked: boolean; onPress: (checked: boolean) => void }) {
    return (
        <Pressable onPress={() => onPress(!checked)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FormCheckbox checked={checked} />
            <Text variant="text-md/normal">{label}</Text>
        </Pressable>
    );
}

const VARIANT_CONFIG = {
    info: {
        background: "CARD_PRIMARY_BG",
        textColor: "text-normal",
        timestampColor: "text-muted",
    },
    warn: {
        background: "INFO_WARNING_BACKGROUND",
        textColor: "text-normal",
        timestampColor: "text-muted",
    },
    error: {
        background: "STATUS_DANGER",
        textColor: "white",
        timestampColor: "white",
    },
    debug: {
        background: "CARD_PRIMARY_BG",
        textColor: "text-normal",
        timestampColor: "text-muted",
    },
} as const;

// Mock data
const SAMPLE_MESSAGES = {
    info: [
        "Connection established",
        "Database query completed successfully with 1024 records returned in 350ms",
        "Cache invalidated for user session tokens due to security policy update",
        "As a twenty year old single male I think it's very hard to find a girl who's actually interested in free software. I've had girls jokingly ask to \"Netflix and chill\" but when I tell her that I don't use Netflix since Netflix requires proprietary software to stream content, they stop talking to me. And worse if they do stay they think I'm weird since I blocked google IP's in my host file and we can't even watch youtube. I can't ever seem to get girls to come over to my place and I can't text them either. Once I get their numbers since I've added customs roms to my phone and refuse to use sms since it's a security concern I require all of my friends to download a free and open source messaging app and I share with them my public gpg key so that we can verify that our conversations are secure. None of my friends are willing to do this. And I can't use sites like tinder since it's not only proprietary software but a major privacy vulnerability. How come it is so hard to find a girl concerned about software freedom. I feel like I'm going to be a virgin forever.",
    ],
    warn: [
        "Resource usage high: CPU utilization has exceeded 85% threshold for over 5 minutes",
        "Disk space low",
        "Network latency detected between application server and database cluster (avg 230ms)",
        "Rate limit exceeded: API requests will be throttled for the next 30 seconds",
    ],
    error: [
        "Server unreachable: Connection attempts to auth-service failed after 5 retries",
        "Authentication failed",
        "Background task timed out after 120 seconds while processing large media file conversion",
        "Resource limit exceeded: Maximum allowed memory allocation (2GB) reached in worker process",
    ],
    debug: ["Component re-rendered", "State updated", "API response received", "User session token refreshed"],
} as const;

// Helper functions
const generateMockLogs = (count: number): Log[] =>
    Array.from({ length: count }, () => {
        const levelRandom = Math.random();
        const level = levelRandom > 0.9 ? "error" : levelRandom > 0.75 ? "warn" : levelRandom > 0.6 ? "debug" : "info";
        const messageIndex = Math.floor(Math.random() * 4);
        const hasError = level === "error" || (level === "warn" && Math.random() > 0.8);

        return {
            level,
            message: SAMPLE_MESSAGES[level][messageIndex],
            timestamp: Date.now() - Math.floor(Math.random() * 86400000),
            error: hasError ? new Error(`Error with ${SAMPLE_MESSAGES[level][messageIndex].toLowerCase()}`) : undefined,
            breadcrumbs: hasError
                ? ["Error", "ErrorBoundary", "AppRoot"]
                : Math.random() > 0.5
                  ? ["Info", "AppRoot"]
                  : [],
        };
    });

const LOG_HISTORY_MOCK = generateMockLogs(100);

// Components
const LogDetails = ({ log }: { log: Log }) => {
    const variantStyles = VARIANT_CONFIG[log.level];
    const backgroundColor = useToken(tokens.colors[variantStyles.background]);

    return (
        <BottomSheet>
            <View style={{ padding: 16, gap: 16 }}>
                <View
                    style={{
                        gap: 4,
                        padding: 12,
                        paddingHorizontal: 16,
                        backgroundColor,
                        borderRadius: 16,
                    }}
                >
                    <Text variant="text-lg/semibold" color={variantStyles.textColor}>
                        {log.level.toUpperCase()}
                    </Text>
                    <Text variant="text-xs/semibold" color={variantStyles.textColor}>
                        {new Date(log.timestamp).toLocaleString()}
                    </Text>
                </View>

                <LogDetailSection title="Message">
                    <Codeblock>{log.message}</Codeblock>
                </LogDetailSection>

                {log.error && (
                    <LogDetailSection title="Error">
                        <ErrorCard header={null} showStackTrace={true} error={log.error} />
                    </LogDetailSection>
                )}
            </View>
        </BottomSheet>
    );
};

const LogDetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View>
        <Text variant="text-sm/semibold" style={{ marginBottom: 4 }}>
            {title}
        </Text>
        {children}
    </View>
);

const LogRow = ({ item: log, index }: { item: Log; index: number }) => {
    const variantStyles = VARIANT_CONFIG[log.level];
    const backgroundColor = useToken(tokens.colors[variantStyles.background]);
    const isFirst = index === 0;
    const isLast = index === LOG_HISTORY_MOCK.length - 1;

    const handlePress = () => {
        showSheet("Log Details", LogDetails, { log });
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
};

// Main component
export default function LogsPage() {
    const [showDebug, setShowDebug] = useState(false);

    const filteredLogs = useMemo(() => {
        return LOG_HISTORY_MOCK.filter(log => log.level !== "debug" || showDebug);
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
                renderItem={({ item, index }) => <LogRow item={item} index={index} />}
                estimatedItemSize={80}
            />
        </PageWrapper>
    );
}
