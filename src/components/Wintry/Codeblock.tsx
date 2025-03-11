import { Platform, Text, TextInput, type StyleProp, type TextStyle } from "react-native";
import { createStyles } from "../utils/styles";
import { constants, tokens } from "@metro/common/libraries";

export interface CodeblockProps {
    selectable?: boolean;
    style?: StyleProp<TextStyle>;
    children?: string;
}

const useStyles = createStyles(() => ({
    codeblock: {
        fontFamily: constants.Fonts.CODE_NORMAL,
        fontSize: 12,
        textAlignVertical: "center",
        backgroundColor: tokens.colors.BACKGROUND_SECONDARY,
        color: tokens.colors.TEXT_NORMAL,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: tokens.colors.BACKGROUND_TERTIARY,
        padding: 10,
    },
}));

// iOS doesn't support the selectable property on RN.Text...
const InputBasedCodeblock = ({ style, children }: CodeblockProps) => (
    <TextInput editable={false} multiline style={[useStyles().codeblock, style && style]} value={children} />
);

const TextBasedCodeblock = ({ selectable, style, children }: CodeblockProps) => (
    <Text selectable={selectable} style={[useStyles().codeblock, style && style]}>
        {children}
    </Text>
);

export default function Codeblock({ selectable, style, children }: CodeblockProps) {
    if (!selectable) return <TextBasedCodeblock style={style}>{children}</TextBasedCodeblock>;

    return Platform.select({
        ios: <InputBasedCodeblock style={style}>{children}</InputBasedCodeblock>,
        default: (
            <TextBasedCodeblock style={style} selectable>
                {children}
            </TextBasedCodeblock>
        ),
    });
}
