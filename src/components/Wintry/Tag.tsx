import { View } from "react-native";
import { Text } from "../Discord";
import { tokens, useToken } from "@metro/common/libraries";

interface TagProps {
    text: string;
}

export default function Tag({ text }: TagProps) {
    const color = useToken(tokens.colors.BG_BRAND);

    return (
        <View
            style={{
                backgroundColor: color,
                borderRadius: 18,
                paddingVertical: 4,
                paddingHorizontal: 8,
            }}
        >
            <Text variant="eyebrow" color="white">
                {text}
            </Text>
        </View>
    );
}
