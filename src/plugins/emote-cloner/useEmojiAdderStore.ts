import { create } from "zustand";
import type { EmojiNode } from "./types";
import { findByProps } from "@metro";
import { fetchAsDataUrl } from "@utils/network/fetchAsDataUrl";

export const Emojis = findByProps("uploadEmoji");

interface UploadInfo {
    guildId: string;
    emojiNode: EmojiNode;
    error: unknown | null;
}

interface EmojiAdderStore {
    isPending: string | null;
    lastUploadInfo: UploadInfo | null;
    customAlt: string | null;

    cleanup: () => void;
    uploadEmoji: (guildId: string, emojiNode: EmojiNode) => Promise<void>;
}

export const useEmojiAdderStore = create<EmojiAdderStore>((set, get) => ({
    isPending: null,
    lastUploadInfo: null,
    customAlt: null,

    cleanup: () => set({ lastUploadInfo: null, customAlt: null }),

    uploadEmoji: async (guildId, emojiNode) => {
        set({
            isPending: guildId,
            lastUploadInfo: null,
        });

        try {
            const dataUrl = await fetchAsDataUrl(emojiNode.src);
            await Emojis.uploadEmoji({
                guildId,
                image: dataUrl,
                name: get().customAlt ?? emojiNode.alt,
            });

            set({ lastUploadInfo: { guildId, emojiNode, error: null } });
        } catch (error) {
            set({ lastUploadInfo: { guildId, emojiNode, error } });
        } finally {
            set({ isPending: null });
        }
    },
}));
