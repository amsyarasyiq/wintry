import { t } from "@i18n";
import { isValidElement, type ReactNode } from "react";
import Button from "./Discord/Button/Button";
import { Card, Stack, Text } from "./Discord";
import TwinButtons from "./Discord/experimental/TwinButtons";

export const INDEX_BUNDLE_FILE: string = window.HermesInternal.getFunctionLocation(window.__r).fileName;

interface ErrorCardProps {
    error: unknown;
    header?: string | ReactNode;
    onRetryRender?: () => void;
}

// TODO: Actually implement this
function Codeblock(props: { children: string; selectable?: boolean }) {
    return <Text>{props.children}</Text>;
}

export default function ErrorCard(props: ErrorCardProps) {
    return (
        <Card>
            <Stack>
                {isValidElement(props.header) ? (
                    props.header
                ) : (
                    <Text variant="heading-lg/bold">{t.error_boundary.uh_oh()}</Text>
                )}
                <Codeblock selectable={true}>{String(props.error)}</Codeblock>
                <TwinButtons>
                    {props.onRetryRender && (
                        <Button
                            variant="destructive"
                            text={t.error_boundary.retry_render()}
                            onPress={props.onRetryRender}
                        />
                    )}
                    {props.error instanceof Error ? <Button text={"Details"} onPress={() => {}} /> : undefined}
                </TwinButtons>
            </Stack>
        </Card>
    );
}
