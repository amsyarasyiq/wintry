import { getComponentFromProps } from "../util";

interface FormSwitchProps {
    value: boolean;
    disabled?: boolean;
    onValueChange: (value: boolean) => void;
}

export default getComponentFromProps("FormSwitch", { singular: true }) as React.FC<FormSwitchProps>;
