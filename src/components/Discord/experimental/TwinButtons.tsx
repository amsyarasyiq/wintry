import type { ReactNode } from "react";
import { getComponentFromProps } from "../util";

interface TwinButtonsProps {
    children: ReactNode;
}

export default getComponentFromProps<TwinButtonsProps>("TwinButtons");
