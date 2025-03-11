import { View } from "react-native";
import type React from "react";
import { Text } from "@components/Discord";

export function InfoSection({
    label,
    children,
}: {
    label?: string;
    children?: React.ReactNode | string;
}) {
    return (
        <View>
            <Text variant="heading-sm/semibold" color="text-secondary" style={{ marginBottom: 8 }}>
                {label}
            </Text>
            {typeof children === "string" ? <Text variant="text-md/medium">{children}</Text> : children}
        </View>
    );
}
