import { tokens, useToken } from "@metro/common/libraries";
import { View } from "react-native";
import { Text } from "../Discord";
import { CircleCheckIcon, CircleInformationIcon, WarningIcon } from "@metro/common/icons";

type CalloutVariant = "info" | "success" | "warning" | "danger";

interface CalloutProps {
    title: string;
    children: string | React.ReactNode;
    variant?: CalloutVariant;
}

const CALLOUT_VARIANT_CONFIG = {
    info: {
        background: "INFO_BOX_BACKGROUND",
        foreground: "CREATOR_REVENUE_INFO_BOX_BORDER",
        textColor: "info-positive-text",
        Icon: CircleInformationIcon,
    },
    success: {
        background: "INFO_POSITIVE_BACKGROUND",
        foreground: "INFO_POSITIVE_FOREGROUND",
        textColor: "info-positive-text",
        Icon: CircleCheckIcon,
    },
    warning: {
        background: "INFO_WARNING_BACKGROUND",
        foreground: "INFO_WARNING_FOREGROUND",
        textColor: "info-positive-text",
        Icon: WarningIcon,
    },
    danger: {
        background: "INFO_DANGER_BACKGROUND",
        foreground: "INFO_DANGER_FOREGROUND",
        textColor: "info-positive-text",
        Icon: WarningIcon,
    },
};

export default function Callout({ title, children, variant = "info" }: CalloutProps) {
    const config = CALLOUT_VARIANT_CONFIG[variant];
    const backgroundColor = useToken(tokens.colors[config.background]);
    const borderColor = useToken(tokens.colors[config.foreground]);
    const IconComponent = config.Icon;

    return (
        <View
            style={{
                padding: 16,
                backgroundColor,
                borderWidth: 1,
                borderColor,
                borderRadius: 12,
                rowGap: 8,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <IconComponent style={{ width: 18, height: 18 }} />
                {title && <Text variant="heading-lg/semibold">{title}</Text>}
            </View>
            <Text variant="text-md/medium" color={config.textColor}>
                {children}
            </Text>
        </View>
    );
}
