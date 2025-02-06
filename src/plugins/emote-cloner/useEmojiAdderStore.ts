import { create } from "zustand";
import type { EmojiNode } from "./types";
import { findByProps } from "@metro";
import { fetchAsDataUrl } from "@utils/network/fetchAsDataUrl";
import { delay } from "es-toolkit";

export const Emojis = findByProps("uploadEmoji");

interface UploadInfo {
    guildId: string;
    emojiNode: EmojiNode;
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
            // await Emojis.uploadEmoji({
            //     guildId,
            //     image: dataUrl,
            //     name: get().customAlt ?? emojiNode.alt,
            // });

            await delay(1000);
            if (Math.random() > 0.5) throw new Error("Failed to upload emoji");

            set({ status: "success" });
            set({ recentUploadDetails: { guildId, emojiNode, error: null } });
        } catch (error) {
            set({ status: "error" });
            set({ recentUploadDetails: { guildId, emojiNode, error } });
        }
    },
}));
