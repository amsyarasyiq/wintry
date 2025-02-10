import { useMemo } from "react";
import { useEmojiAdderStore } from "../stores/useEmojiAdderStore";
import type { PartialGuild, EmojiNode } from "../types";
import { EmojiStore } from "@metro/new/common/stores";
import { FluxUtils } from "@metro/new/common/libraries/Flux";

export function useSlots(
    guild: PartialGuild,
    emojiNode: EmojiNode,
): { isAnimated: boolean; availableSlots: number; maxSlots: number; hasDuplicate: boolean } {
    const currentAlt = useEmojiAdderStore(s => s.customAlt) || emojiNode.alt;
    const guildEmojis = FluxUtils.useStateFromStores(
        [EmojiStore],
        () => EmojiStore.getGuilds()[guild.id]?.emojis ?? [],
    );

    return useMemo(() => {
        const maxSlots = guild.getMaxEmojiSlots();
        const isAnimated = emojiNode.src.includes(".gif");
        const currentCount = guildEmojis.filter((e: { animated: boolean }) => e?.animated === isAnimated).length;

        return {
            hasDuplicate: guildEmojis.some((e: { name: string }) => e.name === currentAlt),
            availableSlots: maxSlots - currentCount,
            maxSlots,
            isAnimated,
        };
    }, [currentAlt, guild, emojiNode, guildEmojis]);
}
