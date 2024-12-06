declare const WINTRY_START_TIME: number;
let lastTimestamp = 0;

export function trackPerformance(key: string) {
    const now = nativePerformanceNow();

    const timestamp = now - WINTRY_START_TIME;

    lastTimestamp = timestamp;
    return timestamp;
}
