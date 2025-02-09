import { t } from "@i18n";
import { parseComponentStack } from "@utils/errors/parseComponentStack";
import { useState } from "react";
import { View } from "react-native";
import { CollapsibleHandler } from "./CollapsibleHandler";
import { copyToClipboard } from "@utils/clipboard";
import { Card, Text } from "@components/Discord";

interface ErrorComponentStackCardProps {
    componentStack: string;
}

export default function ErrorComponentStackCard(props: ErrorComponentStackCardProps) {
    const [collapsed, setCollapsed] = useState(true);

    let stack: string[];

    try {
        stack = parseComponentStack(props.componentStack);
        stack = collapsed ? stack.slice(0, 4) : stack;
    } catch {
        return null;
    }

    return (
        <Card>
            <View style={{ gap: 8 }}>
                <Text variant="heading-lg/bold">{t.error_boundary.screen.component_stack()}</Text>
                <View style={{ gap: 4 }}>
                    {stack.map((component, index) => (
                        <View key={index} style={{ flexDirection: "row" }}>
                            <Text variant="text-md/bold" color="text-muted">
                                {"<"}
                            </Text>
                            <Text variant="text-md/bold">{component}</Text>
                            <Text variant="text-md/bold" color="text-muted">
                                {"/>"}
                            </Text>
                        </View>
                    ))}
                </View>
                {collapsed && <Text>...</Text>}
                <CollapsibleHandler
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    onCopy={() => copyToClipboard(props.componentStack, { toast: false })}
                />
            </View>
        </Card>
    );
}
