import { showSheet } from "@components/utils/sheets";
import { MessageEmojiActionSheet, Surrogates } from "../common";

export function openEmojiActionSheet({
    id,
    name,
    animated,
}: {
    id: string;
    name: string;
    animated?: boolean;
}) {
    try {
        showSheet(
            "MessageEmojiActionSheet",
            MessageEmojiActionSheet,
            {
                emojiNode: id
                    ? {
                          id: id,
                          alt: name,
                          src: `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "webp"}?size=128`,
                      }
                    : {
                          content: Surrogates.convertSurrogateToName(name),
                          surrogate: name,
                      },
            },

            "stack",
        );
    } catch (err) {
        console.log("Failed to open action sheet", err);
    }
}
