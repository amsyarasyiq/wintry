import type { LogDetails } from "@api/logger";

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
        "Chiya-san! Coco-nee becomes a drug dealer in the future and might disappear! What should I do!?",
    ],
    error: [
        "Server unreachable: Connection attempts to auth-service failed after 5 retries",
        "Authentication failed",
        "Background task timed out after 120 seconds while processing large media file conversion",
        "Resource limit exceeded: Maximum allowed memory allocation (2GB) reached in worker process",
    ],
    debug: ["Component re-rendered", "State updated", "API response received", "User session token refreshed"],
} as const;

const generateMockLogs = (count: number): LogDetails[] =>
    Array.from({ length: count }, () => {
        const levelRandom = Math.random();
        const level = levelRandom > 0.9 ? "error" : levelRandom > 0.75 ? "warn" : levelRandom > 0.6 ? "debug" : "info";
        const messageIndex = Math.floor(Math.random() * 4);
        const hasError = level === "error" || (level === "warn" && Math.random() > 0.8);

        return {
            level,
            message: SAMPLE_MESSAGES[level][messageIndex],
            timestamp: Date.now() - Math.floor(Math.random() * 86400000),
            errorStack: hasError
                ? new Error(`Error with ${SAMPLE_MESSAGES[level][messageIndex].toLowerCase()}`).stack
                : undefined,
            breadcrumbs: hasError
                ? ["Error", "ErrorBoundary", "AppRoot"]
                : Math.random() > 0.5
                  ? ["Info", "AppRoot"]
                  : [],
        };
    });

export const LOG_HISTORY_MOCK = generateMockLogs(100);
