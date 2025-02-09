import { getComponentFromProps } from "../util";

interface SliderProps {
    step: number;
    value: number;
    minimumValue: number;
    maximumValue: number;
    onValueChange: (value: number) => void;
    onSlidingStart?: () => void;
    onSlidingComplete?: (value: number) => void;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

export default getComponentFromProps<SliderProps>("Slider");
