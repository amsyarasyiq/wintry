import { create } from "zustand";
import type { EmojiNode } from "./types";

interface UploadInfo {
    guildId: string;
    emojiNode: EmojiNode;
    error: Error | null;
}

interface EmojiAdderStore {
    isPending: string | null;
    lastUploadInfo: UploadInfo | null;
    customAlt: string | null;

    cleanup: () => void;
    uploadEmoji: (guildId: string, emojiNode: EmojiNode) => void;
}

export const useEmojiAdderStore = create<EmojiAdderStore>((set, get) => ({
    isPending: null,
    lastUploadInfo: null,
    customAlt: null,

    cleanup: () => set({ lastUploadInfo: null, customAlt: null }),

    uploadEmoji: (guildId, emojiNode) => {
        set({
            isPending: guildId,
            lastUploadInfo: null,
        });

        setTimeout(() => {
            // TODO: Implement actual upload logic
            if (get().isPending === guildId) {
                if (Math.random() > 0.5) {
                    set({ lastUploadInfo: { guildId, emojiNode, error: new Error("Failed to upload emoji") } });
                } else {
                    set({ lastUploadInfo: { guildId, emojiNode, error: null } });
                }
            }

            set({ isPending: null });
        }, 1000);
    },
}));
