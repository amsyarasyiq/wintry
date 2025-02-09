import { getComponentFromProps } from "../util";

interface FormRadioProps {
    selected: boolean;
}

export default getComponentFromProps("FormRadio", { singular: true }) as React.FC<FormRadioProps>;
