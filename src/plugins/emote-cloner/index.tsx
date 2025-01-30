import { definePlugin, meta } from "#plugin-context";
import { showSheet } from "@components/utils/sheets";
import { Devs } from "@data/constants";
import { findByFilePath, findByStoreName } from "@metro";
import {
    ActionSheet,
    BottomSheetTitleHeader,
    Button,
    Card,
    FlashList,
    TableRow,
    Text,
    TextInput,
    constants,
    toasts,
    FluxUtils,
    clipboard,
} from "@metro/common";
import { createContextualPatcher } from "@patcher/contextual";
import { findInReactTree } from "@utils/objects";
import { useMemo } from "react";
import { Keyboard, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { Fragment } from "react/jsx-runtime";
import { useEmojiAdderStore } from "./useEmojiAdderStore";
import type { PartialGuild, EmojiNode } from "./types";
import { useShallow } from "zustand/shallow";
import { isError } from "@utils/errors/isError";

const patcher = createContextualPatcher({ pluginId: meta.id });
const CustomEmojiContent = findByFilePath("modules/messages/native/emoji/CustomEmojiContent.tsx");

const GuildIcon = findByFilePath("uikit-native/GuildIcon.tsx", true);
const Icon = findByFilePath("uikit-native/Icon.tsx");

const GuildStore = findByStoreName("GuildStore");
const PermissionStore = findByStoreName("PermissionStore");
const EmojiStore = findByStoreName("EmojiStore");

function ServerRow({
    start,
    end,
    guild,
    emojiNode,
}: { start: boolean; end: boolean; guild: PartialGuild; emojiNode: EmojiNode }) {
    const [isPending, uploadEmoji] = useEmojiAdderStore(useShallow(s => [s.isPending, s.uploadEmoji]));
    const { isAnimated, availableSlots, maxSlots, hasDuplicate } = useSlots(guild, emojiNode);

    return (
        <TableRow
            label={guild.name}
            subLabel={`${availableSlots}/${maxSlots}${isAnimated ? " animated" : " static"} slots available ${hasDuplicate ? "(has duplicate name)" : ""}`}
            disabled={isPending != null || availableSlots <= 0}
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

function useSlots(
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

function UploadInfoCard() {
    const { isPending, lastUploadInfo } = useEmojiAdderStore();

    if (!isPending && !lastUploadInfo) return null;

    const { guildId, emojiNode, error } = lastUploadInfo ?? {};

    return (
        <Card style={{ padding: 12 }}>
            {isPending ? (
                <Text variant="text-lg/semibold">Uploading emoji...</Text>
            ) : (
                lastUploadInfo && (
                    <>
                        <Text variant="text-lg/semibold">{!error ? "✅ Upload Successful" : "❌ Upload Failed"}</Text>
                        <Text style={{ marginTop: 4 }}>Server: {guildId}</Text>
                        {error && (
                            <Text style={{ marginTop: 4, color: "#ff4444" }}>
                                Error: {isError(error) ? error.message : String(error) || "Unknown error occurred"}
                            </Text>
                        )}
                        {emojiNode && <Text style={{ marginTop: 4 }}>Emoji name: {emojiNode.alt}</Text>}
                    </>
                )
            )}
        </Card>
    );
}

function EmoteStealerActionSheet({ emojiNode }: { emojiNode: EmojiNode }) {
    const customAlt = useEmojiAdderStore(s => s.customAlt);

    // Get guilds as a Array of ID and value pairs, and filter out guilds the user can't edit emojis in
    const guilds = Object.values(GuildStore.getGuilds()).filter(guild =>
        PermissionStore.can(constants.Permissions.MANAGE_GUILD_EXPRESSIONS, guild),
    ) as PartialGuild[];

    return (
        <ActionSheet>
            <ScrollView style={{ gap: 12 }}>
                <BottomSheetTitleHeader title={`Clone ${emojiNode.alt}`} />
                <FlashList
                    style={{ flex: 1 }}
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
        </ActionSheet>
    );
}

function StealButtons({ emojiNode, style }: { emojiNode: EmojiNode; style?: StyleProp<ViewStyle> }) {
    return (
        <View style={[{ gap: 8 }, style]}>
            <Button
                text="Clone"
                onPress={() => {
                    useEmojiAdderStore.getState().cleanup();
                    showSheet("EmoteStealerActionSheet", EmoteStealerActionSheet, { emojiNode }, "stack");
                }}
            />
            <Button
                text="Copy URL"
                onPress={async () => {
                    await clipboard.setString(emojiNode.src);
                    toasts.open({
                        key: "emote-stealer-copied-url",
                        content: "Copied URL to clipboard",
                    });
                }}
            />
        </View>
    );
}

export default definePlugin({
    name: "Emote Cloner",
    description: "Clone emotes to other servers.",
    authors: [Devs.Pylix],

    start() {
        // TODO: Once we have own own toast, use that instead
        useEmojiAdderStore.subscribe((s, p) => {
            if (s.isPending && s.isPending !== p.isPending) {
                toasts.open({
                    key: "emote-stealer-uploading",
                    content: "Uploading emoji...",
                });
            }

            if (s.lastUploadInfo && s.lastUploadInfo !== p.lastUploadInfo) {
                toasts.open({
                    key: "emote-stealer-upload-result",
                    content: s.lastUploadInfo.error ? "Upload failed" : "Upload successful",
                });
            }
        });

        patcher.after(CustomEmojiContent, "default", ([{ emojiNode }]: any, res) => {
            if (!emojiNode) return;

            const createStealButton = (paddingTop: number) => (
                <StealButtons style={{ paddingTop }} emojiNode={emojiNode} key="steal-button" />
            );

            const insertAtIndex = (container: unknown[], index: number, paddingTop: number) => {
                container.splice(index, 0, createStealButton(paddingTop));
            };

            const findLastElementIndex = (tree: any, predicate: (c: any) => boolean) => {
                const container = findInReactTree(tree, c => c?.find?.(predicate));
                return [container, container?.findLastIndex?.(predicate) ?? -1];
            };

            const [buttonContainer, buttonIndex] = findLastElementIndex(res, c => c?.type?.name === "Button");
            if (buttonIndex >= 0) {
                insertAtIndex(buttonContainer, buttonIndex + 1, 8);
                return;
            }

            const [dividerContainer, dividerIndex] = findLastElementIndex(
                res,
                (c: any) => c?.type === Fragment && c.props.children[0].type.name === "FormDivider",
            );

            if (dividerIndex >= 0) {
                insertAtIndex(dividerContainer, dividerIndex - 1, 12);
                return;
            }

            // If no button or divider is found, just push it to the end
            res.props.children.push(createStealButton(12));
        });
    },
});
