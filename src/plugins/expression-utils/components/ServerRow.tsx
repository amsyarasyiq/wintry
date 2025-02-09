import { Keyboard } from "react-native";
import { useEmojiAdderStore } from "../stores/useEmojiAdderStore";
import type { PartialGuild, EmojiNode } from "../types";
import { useShallow } from "zustand/shallow";
import { GuildIcon } from "../common";
import { useSlots } from "../utils/useSlots";
import { TableRow } from "@components/Discord";

export default function ServerRow({
    start,
    end,
    guild,
    emojiNode,
}: { start: boolean; end: boolean; guild: PartialGuild; emojiNode: EmojiNode }) {
    const [status, uploadEmoji] = useEmojiAdderStore(useShallow(s => [s.status, s.uploadEmoji]));
    const { isAnimated, availableSlots, maxSlots, hasDuplicate } = useSlots(guild, emojiNode);

    return (
        <TableRow
            label={guild.name}
            subLabel={`${availableSlots}/${maxSlots}${isAnimated ? " animated" : " static"} slots available ${hasDuplicate ? "(has duplicate name)" : ""}`}
            disabled={status === "pending" || availableSlots <= 0}
            icon={<GuildIcon guild={guild} size="NORMAL" animate={false} />}
            onPress={() => {
                Keyboard.dismiss();
                uploadEmoji(guild.id, emojiNode);
            }}
            start={start}
            end={end}
        />
    );
}
