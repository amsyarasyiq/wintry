import { getComponentFromProps } from "../util";
import type { TextInputProps } from "./TextInput";

interface TextAreaProps extends Omit<TextInputProps, "size"> {}

export default getComponentFromProps<TextAreaProps>("TextArea", { singular: true });
