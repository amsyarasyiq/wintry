import TableRowDivider from "@components/Discord/TableRow/TableRowDivider";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { InlineCheckbox } from "../../InlineCheckbox";
import { LogRow } from "./LogRow";

export interface Log {
    level: "info" | "warn" | "error" | "debug";
    message: string;
    timestamp: number;
    error?: Error;
    breadcrumbs?: Array<string>;
}

export const VARIANT_CONFIG = {
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

export const LOG_HISTORY_MOCK = generateMockLogs(100);

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
