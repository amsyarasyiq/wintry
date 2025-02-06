import Codeblock from "@components/Codeblock";
import { createStyles } from "@components/utils/styles";
import { findAssetId, findByProps } from "@metro";
import { Text, tokens } from "@metro/common";
import { View, ActivityIndicator, Image } from "react-native";
import Animated, { CurvedTransition } from "react-native-reanimated";
import { GuildIcon, GuildStore } from "../common";
import { useShallow } from "zustand/shallow";
import { useEmojiAdderStore } from "../stores/useEmojiAdderStore";
import type { PartialGuild } from "../types";
import { lazyDestructure } from "@utils/lazy";
import { isError } from "@utils/errors/isError";

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
    container: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    rowContainer: {
        flexDirection: "row",
        gap: 8,
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

// Then in your component, replace the inline styles with the style references:
export default function UploadStatusView() {
    const styles = useStyles();
    const [status, recentUploadDetails] = useEmojiAdderStore(useShallow(s => [s.status, s.recentUploadDetails]));

    if (status === "idle" && !recentUploadDetails) {
        return null;
    }

    const { guildId, emojiNode, customAlt, error } = recentUploadDetails ?? {};
    const guild = GuildStore.getGuild(guildId) as PartialGuild;

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
                            <Text variant="text-md/semibold">{guild.name}</Text>
                            <ArrowSmallLeftIcon />
                            <Image source={{ uri: emojiNode.src }} style={styles.emojiImage} />
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
                <View style={styles.centeredContainer}>
                    <View style={styles.rowContainer}>
                        <Image source={findAssetId("XLargeBoldIcon")} style={styles.xIcon} />
                        <Text variant="text-lg/semibold">Upload Failed</Text>
                    </View>
                    <Codeblock>{`${((isError(error) && error.stack) || String(error)).slice(0, 100)}...`}</Codeblock>
                </View>
            )}
        </Animated.View>
    );
}
