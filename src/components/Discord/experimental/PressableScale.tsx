import type { PressableProps } from "react-native";
import { getComponentFromProps } from "../util";

interface PressableScaleProps extends PressableProps {}

export default getComponentFromProps<PressableScaleProps>("PressableScale");
