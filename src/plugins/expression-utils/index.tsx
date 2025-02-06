import { definePlugin, meta } from "#plugin-context";
import { showSheet } from "@components/utils/sheets";
import { Devs } from "@data/constants";
import { findAssetId, findByFilePath, findByProps, findByStoreName } from "@metro";
import { ActionSheet, Button, FlashList, TableRow, Text, TextInput, constants, FluxUtils, tokens } from "@metro/common";
import { createContextualPatcher } from "@patcher/contextual";
import { findInReactTree } from "@utils/objects";
import { useMemo } from "react";
import { ActivityIndicator, Image, Keyboard, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { Fragment } from "react/jsx-runtime";
import { useEmojiAdderStore } from "./useEmojiAdderStore";
import type { PartialGuild, EmojiNode } from "./types";
import { useShallow } from "zustand/shallow";
import { Toast } from "@api/toasts";
import Animated, { CurvedTransition } from "react-native-reanimated";
import { isError } from "@utils/errors/isError";
import Codeblock from "@components/Codeblock";
import { createStyles } from "@components/utils/styles";
import { lazyDestructure } from "@utils/lazy";
import { copyToClipboard } from "@utils/clipboard";

const patcher = createContextualPatcher({ pluginId: meta.id });
const CustomEmojiContent = findByFilePath("modules/messages/native/emoji/CustomEmojiContent.tsx");

const GuildIcon = findByFilePath("uikit-native/GuildIcon.tsx", true);
const Icon = findByFilePath("uikit-native/Icon.tsx");

const GuildStore = findByStoreName("GuildStore");
const PermissionStore = findByStoreName("PermissionStore");
const EmojiStore = findByStoreName("EmojiStore");
const { ArrowSmallLeftIcon } = lazyDestructure(() => findByProps("ArrowSmallLeftIcon"));

const useStyles = createStyles(() => ({
    checkmarkIcon: {
        width: 24,
        height: 24,
        tintColor: tokens.colors.TEXT_POSITIVE,
    },
    xIcon: {
        width: 24,
        height: 24,
        tintColor: tokens.colors.TEXT_DANGER,
    },
}));

function ServerRow({
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

function UploadStatusView() {
    const styles = useStyles();
    const [status, recentUploadDetails] = useEmojiAdderStore(useShallow(s => [s.status, s.recentUploadDetails]));

    if (status === "idle" && !recentUploadDetails) {
        return null;
    }

    const { guildId, emojiNode, customAlt, error } = recentUploadDetails ?? {};
    const guild = GuildStore.getGuild(guildId) as PartialGuild;

    return (
        <Animated.View
            layout={CurvedTransition}
            style={{ paddingVertical: 12, paddingHorizontal: 24, justifyContent: "center", alignItems: "center" }}
        >
            {status === "pending" && (
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <ActivityIndicator size="small" />
                    <Text variant="text-lg/semibold">Uploading emoji...</Text>
                </View>
            )}
            {status === "success" && (
                <View style={{ gap: 8, alignItems: "center" }}>
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <Image source={findAssetId("CheckmarkLargeBoldIcon")} style={styles.checkmarkIcon} />
                        <Text variant="text-lg/semibold">Upload Successful</Text>
                    </View>
                    {emojiNode && (
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <GuildIcon guild={guild} size="XSMALL" animate={false} />
                            <Text variant="text-md/semibold">{guild.name}</Text>
                            <ArrowSmallLeftIcon />
                            <Image source={{ uri: emojiNode.src }} style={{ width: 24, height: 24 }} />
                            <Text variant="text-md/semibold">
                                {customAlt && customAlt !== emojiNode.alt
                                    ? `:${customAlt}: (${emojiNode.alt})`
                                    : `:${emojiNode.alt}:`}
                            </Text>
                        </View>
                    )}
                </View>
            )}
            {status === "error" && error != null && (
                <View style={{ gap: 8, alignItems: "center" }}>
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        <Image source={findAssetId("XLargeBoldIcon")} style={styles.xIcon} />
                        <Text variant="text-lg/semibold">Upload Failed</Text>
                    </View>
                    <Codeblock>{`${((isError(error) && error.stack) || String(error)).slice(0, 100)}...`}</Codeblock>
                </View>
            )}
        </Animated.View>
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
                <View style={{ alignItems: "center" }}>
                    <Text variant="heading-lg/bold">
                        Clone :{emojiNode.alt}:{"  "}
                        <Image resizeMode="contain" source={{ uri: emojiNode.src }} style={{ width: 24, height: 24 }} />
                    </Text>
                </View>
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
            <Button text="Copy URL" onPress={() => copyToClipboard(emojiNode.src)} />
        </View>
    );
}

export default definePlugin({
    name: "ExpressionUtils",
    description: "Adds more emotes and stickers utilities such as cloning or copying links.",
    authors: [Devs.Pylix],

    start() {
        const toast = new Toast({
            type: "custom",
            content: {
                render: UploadStatusView,
            },
            options: {
                duration: Number.MAX_SAFE_INTEGER,
            },
        });

        useEmojiAdderStore.subscribe((s, p) => {
            if (
                (s.status !== "idle" && s.status !== p.status) ||
                (s.recentUploadDetails && s.recentUploadDetails !== p.recentUploadDetails)
            ) {
                toast.show();

                if (s.status === "success" || s.status === "error") {
                    toast.update({ options: { duration: 5000 } });
                }
            }

            // Post-cleanup
            if (s.status === "idle") {
                toast.hide();
                toast.update({ options: { duration: Number.MAX_SAFE_INTEGER } });
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
