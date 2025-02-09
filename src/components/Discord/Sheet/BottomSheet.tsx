import type { StyleProp, ViewStyle } from "react-native";
import { getComponentFromProps } from "../util";

interface BottomSheetProps {
    bodyStyles?: StyleProp<ViewStyle>;
    contentStyles?: StyleProp<ViewStyle>;
    children: React.ReactNode;
}

export default getComponentFromProps<BottomSheetProps>("BottomSheet");
