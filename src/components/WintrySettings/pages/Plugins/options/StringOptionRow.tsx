import { usePluginSettings } from "../common/usePluginSettings";
import type { BaseOptionRowProps } from "./BaseOptionRowProps";
import { getIcon } from "../common/getIcon";
import { TableRow } from "@components/Discord";
import TextArea from "@components/Discord/TextInput/TextArea";
import TextInput from "@components/Discord/TextInput/TextInput";

export function StringOptionRow({ opt, plugin, settingKey }: BaseOptionRowProps<"string">) {
    const [current, setter] = usePluginSettings<typeof opt>(plugin.$id, settingKey);

    const InputComponent = opt.textArea === true ? TextArea : TextInput;
    const isValid = () => (current && opt.validate ? opt.validate(current) : true);

    return (
        <TableRow
            label={
                <InputComponent
                    size="sm"
                    label={opt.label}
                    placeholder={opt.placeholder}
                    value={current}
                    onChange={(v: string) => setter(v)}
                    state={isValid() ? "error" : undefined}
                    errorMessage={isValid() ? undefined : "Invalid input"}
                />
            }
            subLabel={opt.description}
            icon={getIcon(opt.icon)}
        />
    );
}
