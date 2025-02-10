import { Image, ScrollView, View } from "react-native";
import { useEmojiAdderStore } from "../stores/useEmojiAdderStore";
import type { PartialGuild, EmojiNode } from "../types";
import ServerRow from "../components/ServerRow";
import { GuildStore, PermissionStore } from "@metro/common/stores";
import { FlashList } from "@shopify/flash-list";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";
import { Text, TextInput } from "@components/Discord";
import { constants } from "@metro/common/libraries";

export default function EmoteStealerActionSheet({ emojiNode }: { emojiNode: EmojiNode }) {
    const customAlt = useEmojiAdderStore(s => s.customAlt);

    // Get guilds as a Array of ID and value pairs, and filter out guilds the user can't edit emojis in
    const guilds = Object.values(GuildStore.getGuilds()).filter(guild =>
        PermissionStore.can(constants.Permissions.MANAGE_GUILD_EXPRESSIONS, guild),
    ) as PartialGuild[];

    return (
        <BottomSheet contentStyles={{ paddingHorizontal: 16 }}>
            <ScrollView style={{ gap: 12 }}>
                <View style={{ alignItems: "center" }}>
                    <Text variant="heading-lg/bold">
                        Clone :{emojiNode.alt}:{"  "}
                        <Image resizeMode="contain" source={{ uri: emojiNode.src }} style={{ width: 24, height: 24 }} />
                    </Text>
                </View>
                <FlashList
                    style={{ flex: 1 }}
                    estimatedItemSize={63}
                    ListHeaderComponent={
                        <View style={{ gap: 12, paddingVertical: 12 }}>
                            <TextInput
                                label="Emoji Name"
                                description="The name of the emoji to be uploaded"
                                placeholder={emojiNode.alt}
                                value={customAlt ?? emojiNode.alt}
                                onChange={text => useEmojiAdderStore.setState({ customAlt: text })}
                            />
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 24 }}
                    data={guilds}
                    keyboardShouldPersistTaps="handled"
                    keyExtractor={x => x.id}
                    renderItem={({ item, index }) => (
                        <ServerRow
                            start={index === 0}
                            end={index === guilds.length - 1}
                            guild={item}
                            emojiNode={emojiNode}
                        />
                    )}
                />
            </ScrollView>
        </BottomSheet>
    );
}
