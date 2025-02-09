import type { ReactElement } from "react";
import { getComponentFromProps } from "../util";

interface TwinButtonsProps {
    children: (ReactElement | undefined)[];
}

export default getComponentFromProps<TwinButtonsProps>("TwinButtons");
