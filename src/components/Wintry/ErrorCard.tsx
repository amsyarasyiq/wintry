import { t } from "@i18n";
import { isValidElement, type ReactNode } from "react";
import Button from "../Discord/Button/Button";
import { BottomSheet, Card, Stack, Text } from "../Discord";
import TwinButtons from "../Discord/experimental/TwinButtons";
import Codeblock from "./Codeblock";
import { showSheet } from "../utils/sheets";
import { ScrollView } from "react-native";

export const INDEX_BUNDLE_FILE: string = window.HermesInternal.getFunctionLocation(window.__r).fileName;

interface ErrorCardProps {
    error: unknown;
    header?: string | ReactNode;
    showStackTrace?: boolean;
    onRetryRender?: () => void;
}

function formatErrorContent(error: unknown, showStackTrace: boolean): string {
    if (error instanceof Error) {
        return showStackTrace ? error.stack || error.message : error.message;
    }

    try {
        return JSON.stringify(error, null, 2);
    } catch {
        return String(error);
    }
}

function ErrorStack({ error }: { error: Error }) {
    return (
        <BottomSheet>
            <Stack style={{ padding: 12 }}>
                <Text variant="heading-lg/bold">{t.error_boundary.stack_trace()}</Text>
                <Codeblock selectable={true}>{formatErrorContent(error, true)}</Codeblock>
            </Stack>
        </BottomSheet>
    );
}

function openStackTraceSheet(error: Error): void {
    showSheet("Stack Trace", ErrorStack, { error }, "stack");
}

function renderHeader(header?: string | ReactNode): ReactNode {
    // Explicit null: empty header
    if (isValidElement(header) || header === null) {
        return header;
    }

    return <Text variant="heading-lg/bold">{header || t.error_boundary.uh_oh()}</Text>;
}

export default function ErrorCard({ error, header, showStackTrace = false, onRetryRender }: ErrorCardProps) {
    const isErrorInstance = error instanceof Error;
    const shouldShowStackTraceButton = isErrorInstance && !showStackTrace;

    return (
        <Card>
            <Stack>
                {renderHeader(header)}
                <ScrollView contentContainerStyle={{ maxHeight: 180 }} horizontal={true}>
                    <Codeblock selectable={true}>{formatErrorContent(error, showStackTrace)}</Codeblock>
                </ScrollView>
                <TwinButtons>
                    {onRetryRender && (
                        <Button variant="destructive" text={t.error_boundary.retry_render()} onPress={onRetryRender} />
                    )}
                    {shouldShowStackTraceButton && (
                        <Button
                            text={t.error_boundary.stack_trace()}
                            onPress={() => openStackTraceSheet(error as Error)}
                        />
                    )}
                </TwinButtons>
            </Stack>
        </Card>
    );
}
