import { showSheet } from "@components/utils/sheets";
import { MessageEmojiActionSheet, Surrogates } from "../common";
import { logger } from "#plugin-context";

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
        logger.error(`Failed to open emoji action sheet: ${err}`);
    }
}
