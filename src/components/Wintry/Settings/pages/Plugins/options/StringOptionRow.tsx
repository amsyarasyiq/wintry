import { usePluginSettings } from "../common/usePluginSettings";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { getIcon } from "../common/getIcon";
import { TableRow, Text } from "@components/Discord";
import TextArea from "@components/Discord/TextInput/TextArea";
import TextInput from "@components/Discord/TextInput/TextInput";
import { View } from "react-native";

export function StringOptionRow({ opt, plugin, settingKey, start, end }: BaseOptionRowProps<"string">) {
    const [current, setter] = usePluginSettings<typeof opt>(plugin.$id, settingKey);

    const InputComponent = opt.textArea === true ? TextArea : TextInput;
    const isValid = () => (current && opt.validate ? opt.validate(current) : true);

    return (
        <TableRow
            start={start}
            end={end}
            label={
                <View style={{ paddingHorizontal: 6, gap: 4 }}>
                    <InputComponent
                        size="md"
                        label={opt.label}
                        placeholder={opt.placeholder}
                        value={current}
                        onChange={(v: string) => setter(v)}
                        state={isValid() ? "error" : undefined}
                        errorMessage={isValid() ? undefined : "Invalid input"}
                    />
                    <Text variant="text-xs/medium" color="text-muted">
                        {opt.description}
                    </Text>
                </View>
            }
            icon={getIcon(opt.icon)}
        />
    );
}
