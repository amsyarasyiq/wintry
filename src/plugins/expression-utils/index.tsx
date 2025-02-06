import { definePlugin, meta } from "#plugin-context";
import { hideSheet, showSheet } from "@components/utils/sheets";
import { Devs } from "@data/constants";
import { findAssetId, findByFilePath, findByFilePathImmediate, findByProps, findByStoreName } from "@metro";
import {
    ActionSheet,
    Button,
    FlashList,
    TableRow,
    Text,
    TextInput,
    constants,
    FluxUtils,
    tokens,
    PressableScale,
} from "@metro/common";
import { createContextualPatcher } from "@patcher/contextual";
import { findInReactTree } from "@utils/objects";
import { useEffect, useMemo } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Keyboard,
    ScrollView,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
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

function getSizeAsync(src: string): Promise<[width: number, height: number]> {
    return new Promise((resolve, reject) => {
        Image.getSize(
            src,
            (width, height) => {
                resolve([width, height]);
            },
            reject,
        );
    });
}

const mediaModalUtil = findByProps("openMediaModal");

async function openMediaModal(src: string) {
    const [width, height] = await getSizeAsync(src);
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

    hideSheet("MessageEmojiActionSheet");
    mediaModalUtil.openMediaModal({
        initialSources: [
            {
                uri: src,
                sourceURI: src,
                width,
                height,
            },
        ],
        initialIndex: 0,
        originLayout: {
            width: 128,
            height: 128,
            x: screenWidth / 2 - 64,
            y: screenHeight - 64,
            resizeMode: "fill",
        },
    });
}

const Surrogates = findByProps("convertSurrogateToName");

function openEmojiActionSheet({
    id,
    name,
    animated,
}: {
    id: string;
    name: string;
    animated?: boolean;
}) {
    try {
        showSheet(
            "MessageEmojiActionSheet",
            findByFilePathImmediate("modules/messages/native/emoji/MessageEmojiActionSheet.tsx", true),
            {
                emojiNode: id
                    ? {
                          id: id,
                          alt: name,
                          src: `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "webp"}?size=128`,
                      }
                    : {
                          content: Surrogates.convertSurrogateToName(name),
                          surrogate: name,
                      },
            },

            "stack",
        );
    } catch (err) {
        console.log("Failed to open action sheet", err);
    }
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

        function addStealButton(emojiNode: EmojiNode, element: any) {
            const insertAtIndex = (container: unknown[], index: number, paddingTop: number) => {
                container.splice(
                    index,
                    0,
                    <StealButtons style={{ paddingTop }} emojiNode={emojiNode} key="steal-button" />,
                );
            };

            const findLastElementIndex = (tree: any, predicate: (c: any) => boolean) => {
                const container = findInReactTree(tree, c => c?.find?.(predicate));
                return [container, container?.findLastIndex?.(predicate) ?? -1];
            };

            const [buttonContainer, buttonIndex] = findLastElementIndex(element, c => c?.type?.name === "Button");
            if (buttonIndex >= 0) {
                insertAtIndex(buttonContainer, buttonIndex + 1, 8);
                return;
            }

            const [dividerContainer, dividerIndex] = findLastElementIndex(
                element,
                (c: any) => c?.type === Fragment && c.props.children[0].type.name === "FormDivider",
            );

            if (dividerIndex >= 0) {
                insertAtIndex(dividerContainer, dividerIndex - 1, 12);
                return;
            }

            // If no button or divider is found, just push it to the end
            element.props.children.push(
                <StealButtons style={{ paddingTop: 12 }} emojiNode={emojiNode} key="steal-button" />,
            );
        }

        function makeEmojiIconPressable(emojiNode: EmojiNode, element: any) {
            const emojiDetailsChildren = findInReactTree(element, c => c[0]?.type?.name === "FastImageAndroid");
            if (!emojiDetailsChildren) return;

            // Wrap the emoji icon with a PressableScale
            const emojiDetails = emojiDetailsChildren[0];
            emojiDetailsChildren[0] = (
                <PressableScale
                    onPress={() => {
                        openMediaModal(emojiNode.src);
                    }}
                >
                    {emojiDetails}
                </PressableScale>
            );
        }

        patcher.after(CustomEmojiContent, "default", ([{ emojiNode }]: any, res) => {
            if (!emojiNode) return;

            addStealButton(emojiNode, res);
            makeEmojiIconPressable(emojiNode, res);
        });

        const MessageReactionsContent = findByFilePath("modules/reactions/native/MessageReactionsContent.tsx");

        patcher.after(MessageReactionsContent, "MessageReactionsContent", (_, { props }) => {
            const unpatchReactionsHeader = patcher.detached.after(props.header, "type", (_, res) => {
                // Unpatch on unmount
                useEffect(() => unpatchReactionsHeader as () => void, []);

                try {
                    const tabsRow = res.props.children[0];
                    const { tabs, onSelect } = tabsRow.props;

                    // Wrap the tabs in a TouchableOpacity so we can add a long press handler
                    tabsRow.props.tabs = tabs.map((tab: any, i: number) => (
                        <PressableScale
                            key={i}
                            onPress={() => onSelect(tab.props.index)}
                            onLongPress={() => {
                                const { emoji } = tab.props.reaction;
                                openEmojiActionSheet(emoji);
                            }}
                        >
                            {tab}
                        </PressableScale>
                    ));
                } catch {
                    console.error("Failed to patch reaction header.");
                }
            });
        });
    },
});
