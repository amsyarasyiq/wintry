import { definePlugin, meta } from "#plugin-context";
import { Devs } from "@data/constants";
import { createContextualPatcher } from "@patcher/contextual";
import { findInReactTree } from "@utils/objects";
import { useEffect } from "react";
import { Fragment } from "react/jsx-runtime";
import { useEmojiAdderStore } from "./stores/useEmojiAdderStore";
import type { EmojiNode } from "./types";
import { Toast } from "@api/toasts";
import UploadStatusView from "./components/UploadStatusView";
import StealButtons from "./components/StealButtons";
import { openMediaModal } from "./utils/openMediaModal";
import { openEmojiActionSheet } from "./utils/openEmojiActionSheet";
import { CustomEmojiContent, MessageReactionsContent } from "./common";
import PressableScale from "@components/Discord/experimental/PressableScale";

const patcher = createContextualPatcher({ pluginId: meta.id });

function addStealButton(emojiNode: EmojiNode, element: any) {
    const insertAtIndex = (container: unknown[], index: number, paddingTop: number) => {
        container.splice(index, 0, <StealButtons style={{ paddingTop }} emojiNode={emojiNode} key="steal-button" />);
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
    element.props.children.push(<StealButtons style={{ paddingTop: 12 }} emojiNode={emojiNode} key="steal-button" />);
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

            addStealButton(emojiNode, res);
            makeEmojiIconPressable(emojiNode, res);
        });

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
