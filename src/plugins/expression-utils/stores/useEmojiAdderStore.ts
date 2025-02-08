import { create } from "zustand";
import type { EmojiNode } from "../types";
import { fetchAsDataUrl } from "@utils/network/fetchAsDataUrl";
import { EmojiActionCreators } from "../common";

interface UploadInfo {
    guildId: string;
    emojiNode: EmojiNode;
    customAlt: string | null;
    error: unknown | null;
}

interface EmojiAdderStore {
    status: "idle" | "pending" | "success" | "error";
    recentUploadDetails: UploadInfo | null;
    customAlt: string | null;

    cleanup: () => void;
    uploadEmoji: (guildId: string, emojiNode: EmojiNode) => Promise<void>;
}

export const useEmojiAdderStore = create<EmojiAdderStore>((set, get) => ({
    status: "idle",
    recentUploadDetails: null,
    customAlt: null,

    cleanup: () => set({ status: "idle", recentUploadDetails: null, customAlt: null }),

    uploadEmoji: async (guildId, emojiNode) => {
        set({
            status: "pending",
            recentUploadDetails: null,
        });

        try {
            const dataUrl = await fetchAsDataUrl(emojiNode.src);
            await EmojiActionCreators.uploadEmoji({
                guildId,
                image: dataUrl,
                name: get().customAlt ?? emojiNode.alt,
            });

            set({ status: "success" });
            set({
                recentUploadDetails: { guildId, emojiNode, customAlt: get().customAlt ?? emojiNode.alt, error: null },
            });
        } catch (error) {
            set({ status: "error" });
            set({ recentUploadDetails: { guildId, emojiNode, customAlt: null, error } });
        }
    },
}));
