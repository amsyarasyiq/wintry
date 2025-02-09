import type { ReactNode } from "react";
import { getComponentFromProps } from "../util";

interface RedesignCompatProps {
    children: ReactNode;
}

export default getComponentFromProps<RedesignCompatProps>("RedesignCompat");
