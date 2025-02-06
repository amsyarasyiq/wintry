import { findByFilePath, findByProps, findByStoreName } from "@metro";

export const CustomEmojiContent = findByFilePath("modules/messages/native/emoji/CustomEmojiContent.tsx");
export const MessageReactionsContent = findByFilePath("modules/reactions/native/MessageReactionsContent.tsx");
export const GuildIcon = findByFilePath("uikit-native/GuildIcon.tsx", true);
export const MessageEmojiActionSheet = findByFilePath(
    "modules/messages/native/emoji/MessageEmojiActionSheet.tsx",
    true,
);

// Stores
export const GuildStore = findByStoreName("GuildStore");
export const PermissionStore = findByStoreName("PermissionStore");
export const EmojiStore = findByStoreName("EmojiStore");

// Utilities
export const MediaViewer = findByProps("openMediaModal");
export const Surrogates = findByProps("convertSurrogateToName");
