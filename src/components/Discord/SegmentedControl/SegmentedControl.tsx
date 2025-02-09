import { getComponentFromProps } from "../util";
import type { SegmentedControlState } from "./SegmentedControlState";

export interface SegmentedControlProps {
    state: SegmentedControlState;
    variant?: string;
}

export default getComponentFromProps<SegmentedControlProps>("SegmentedControl");
