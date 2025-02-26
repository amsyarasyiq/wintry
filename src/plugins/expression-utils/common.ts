import { byFilePath } from "@metro/common/filters";
import { lookup } from "@metro/api";
import type React from "react";
import { lookupByProps } from "@metro/common/wrappers";

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
).asLazy(r => (MessageEmojiActionSheet = r)) as React.FC<Record<string, unknown>>;

// Utilities
export const MediaViewer = lookupByProps("openMediaModal").asLazy();
export const Surrogates = lookupByProps("convertSurrogateToName").asLazy();
export const EmojiActionCreators = lookupByProps("uploadEmoji").asLazy();
