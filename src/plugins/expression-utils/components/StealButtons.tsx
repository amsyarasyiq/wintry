import { showSheet } from "@components/utils/sheets";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useEmojiAdderStore } from "../stores/useEmojiAdderStore";
import type { EmojiNode } from "../types";
import { copyToClipboard } from "@utils/clipboard";
import EmoteStealerActionSheet from "./EmoteStealerActionSheet";
import Button from "@components/Discord/Button/Button";

export default function StealButtons({ emojiNode, style }: { emojiNode: EmojiNode; style?: StyleProp<ViewStyle> }) {
    return (
        <View style={[{ gap: 8 }, style]}>
            <Button
                text="Clone"
                onPress={() => {
                    useEmojiAdderStore.getState().cleanup();
                    showSheet("EmoteStealerActionSheet", EmoteStealerActionSheet, { emojiNode }, "stack");
                }}
            />
            <Button text="Copy URL" onPress={() => copyToClipboard(emojiNode.src)} />
        </View>
    );
}
