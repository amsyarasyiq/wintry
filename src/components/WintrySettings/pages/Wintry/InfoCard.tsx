import { Card, Text } from "@components/Discord";
import { View, type StyleProp, type ViewStyle } from "react-native";

interface InfoCardProps {
    icon?: React.ReactElement;
    title: string;
    style?: StyleProp<ViewStyle>;
    trailing: React.ReactElement | string;
    onPress: () => void;
}

export function InfoCard({ title, style, icon, onPress, trailing }: InfoCardProps) {
    return (
        <Card style={style} onPress={onPress}>
            <View style={{ gap: 8 }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {icon}
                    <Text numberOfLines={2} style={{ textAlign: "right" }} variant="text-sm/medium" color="text-muted">
                        {trailing}
                    </Text>
                </View>
                <Text variant="heading-md/semibold">{title}</Text>
            </View>
        </Card>
    );
}
