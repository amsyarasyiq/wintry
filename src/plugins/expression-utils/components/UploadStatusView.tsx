import Codeblock from "@components/Codeblock";
import { createStyles } from "@components/utils/styles";
import { View, ActivityIndicator, Image } from "react-native";
import Animated, { CurvedTransition } from "react-native-reanimated";
import { GuildIcon } from "../common";
import { useShallow } from "zustand/shallow";
import { useEmojiAdderStore } from "../stores/useEmojiAdderStore";
import type { EmojiUploadFailure, PartialGuild } from "../types";
import { isError } from "@utils/errors/isError";
import { findAssetId } from "@metro/assets";
import { ArrowSmallLeftIcon } from "@metro/new/common/icons";
import { GuildStore } from "@metro/new/common/stores";
import { Text } from "@components/Discord";
import { tokens } from "@metro/new/common/libraries";

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
    container: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    rowContainer: {
        gap: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    centeredContainer: {
        gap: 8,
        alignItems: "center",
    },
    emojiImage: {
        width: 24,
        height: 24,
    },
}));

function getErrorText(error: unknown) {
    if (isError(error) && error.stack) {
        return error.stack;
    }

    if (error != null && typeof error === "object") {
        try {
            if ("body" in error && "ok" in error && error.ok === false) {
                const response = error as EmojiUploadFailure;
                return response.body.name.join("/");
            }

            return JSON.stringify(error, null, 4);
        } catch {}
    }

    return String(error);
}

function ToastText({ children }: { children: string }) {
    return (
        <Text numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: "40%" }} variant="text-md/semibold">
            {children}
        </Text>
    );
}

// Then in your component, replace the inline styles with the style references:
export default function UploadStatusView() {
    const styles = useStyles();
    const [status, recentUploadDetails] = useEmojiAdderStore(useShallow(s => [s.status, s.recentUploadDetails]));

    if (status === "idle" && !recentUploadDetails) {
        return null;
    }

    const { guildId, emojiNode, customAlt, error } = recentUploadDetails ?? {};
    const guild = GuildStore.getGuild(guildId!) as PartialGuild;

    return (
        <Animated.View layout={CurvedTransition} style={styles.container}>
            {status === "pending" && (
                <View style={styles.rowContainer}>
                    <ActivityIndicator size="small" />
                    <Text variant="text-lg/semibold">Uploading emoji...</Text>
                </View>
            )}
            {status === "success" && (
                <View style={styles.centeredContainer}>
                    <View style={styles.rowContainer}>
                        <Image source={findAssetId("CheckmarkLargeBoldIcon")} style={styles.checkmarkIcon} />
                        <Text variant="text-lg/semibold">Upload Successful</Text>
                    </View>
                    {emojiNode && (
                        <View style={styles.rowContainer}>
                            <GuildIcon guild={guild} size="XSMALL" animate={false} />
                            <ToastText>{guild.name}</ToastText>
                            <ArrowSmallLeftIcon />
                            <Image source={{ uri: emojiNode.src }} style={styles.emojiImage} />
                            <ToastText>
                                {customAlt && customAlt !== emojiNode.alt
                                    ? `:${customAlt}: (${emojiNode.alt})`
                                    : `:${emojiNode.alt}:`}
                            </ToastText>
                        </View>
                    )}
                </View>
            )}
            {status === "error" && error != null && (
                <View style={styles.centeredContainer}>
                    <View style={styles.rowContainer}>
                        <Image source={findAssetId("XLargeBoldIcon")} style={styles.xIcon} />
                        <Text variant="text-lg/semibold">Upload Failed</Text>
                    </View>
                    <Codeblock>{`${getErrorText(error).slice(0, 300)}...`}</Codeblock>
                </View>
            )}
        </Animated.View>
    );
}
