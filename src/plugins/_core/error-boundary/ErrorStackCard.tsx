import { INDEX_BUNDLE_FILE } from "@components/Wintry/ErrorCard";
import parseErrorStack, { type StackFrame } from "@utils/errors/parseErrorStack";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { CollapsibleHandler } from "./CollapsibleHandler";
import { t } from "@i18n";
import { copyToClipboard } from "@utils/clipboard";
import { Card, Text } from "@components/Discord";
import { constants } from "@metro/common/libraries";

export default function ErrorStackCard(props: {
    error: Error & { stack: string };
}) {
    const [collapsed, setCollapsed] = useState(true);

    let stack: StackFrame[];

    try {
        const parsedErrorStack = parseErrorStack(props.error.stack);
        stack = collapsed ? parsedErrorStack.slice(0, 4) : parsedErrorStack;
    } catch {
        return null;
    }

    return (
        <Card>
            <View style={{ gap: 12 }}>
                <Text variant="heading-lg/bold">{t.error_boundary.screen.call_stack()}</Text>
                <View style={{ gap: 4 }}>
                    {stack.map((f, id) => (
                        <Line key={id} frame={f} />
                    ))}
                </View>
                {collapsed && <Text>...</Text>}
                <CollapsibleHandler
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    onCopy={() => copyToClipboard(props.error.stack, { toast: false })}
                />
            </View>
        </Card>
    );
}

function Line(props: { frame: StackFrame }) {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <Pressable onPress={() => setCollapsed(v => !v)}>
            <Text style={{ fontFamily: constants.Fonts.CODE_BOLD }}>{props.frame.methodName}</Text>
            <Text
                style={{ fontFamily: constants.Fonts.CODE_NORMAL }}
                ellipsizeMode="middle"
                numberOfLines={collapsed ? 1 : undefined}
            >
                <Text color="text-muted">
                    {props.frame.file === INDEX_BUNDLE_FILE ? "jsbundle" : props.frame.file}:{props.frame.lineNumber}:
                    {props.frame.column}
                </Text>
            </Text>
        </Pressable>
    );
}
