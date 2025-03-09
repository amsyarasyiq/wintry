import { Text } from "@components/Discord";
import FormCheckbox from "@components/Discord/Forms/FormCheckbox";
import { Pressable } from "react-native";

export function InlineCheckbox({
    label,
    checked,
    onPress,
}: { label: string; checked: boolean; onPress: (checked: boolean) => void }) {
    return (
        <Pressable onPress={() => onPress(!checked)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FormCheckbox checked={checked} />
            <Text variant="text-md/normal">{label}</Text>
        </Pressable>
    );
}
