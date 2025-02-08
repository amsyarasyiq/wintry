import { byFilePath, byProps } from "@metro/filters";
import { lookup } from "@metro/new/api";
import type React from "react";

export const CustomEmojiContent = lookup(
    byFilePath("modules/messages/native/emoji/CustomEmojiContent.tsx", { returnEsmDefault: false }),
).asLazy();

export const MessageReactionsContent = lookup(
    byFilePath("modules/reactions/native/MessageReactionsContent.tsx", { returnEsmDefault: false }),
).asLazy();

export let GuildIcon = lookup(byFilePath("uikit-native/GuildIcon.tsx")).asLazy(r => (GuildIcon = r)) as React.FC<
    Record<string, unknown>
>;

export let MessageEmojiActionSheet = lookup(
    byFilePath("modules/messages/native/emoji/MessageEmojiActionSheet.tsx"),
).asLazy(r => (MessageEmojiActionSheet = r));

// Utilities
export const MediaViewer = lookup(byProps(["openMediaModal"])).asLazy();
export const Surrogates = lookup(byProps(["convertSurrogateToName"])).asLazy();
export const EmojiActionCreators = lookup(byProps(["uploadEmoji"])).asLazy();
