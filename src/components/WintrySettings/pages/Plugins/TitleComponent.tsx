import { View } from "react-native";
import { lazyDestructure } from "@utils/lazy";
import type { WintryPluginInstance } from "@plugins/types";
import { UserStore } from "@metro/common/stores";
import { lookupByName, lookupByProps } from "@metro/common/wrappers";
import AvatarPile from "@components/Discord/Pile/AvatarPile";
import { Text } from "@components/Discord";
import Avatar from "@components/Discord/ui-kit/Avatar";
import { FluxUtils, tokens } from "@metro/common/libraries";
import { createStyles } from "@components/utils/styles";

const showUserProfileActionSheet = lookupByName("showUserProfileActionSheet").asLazy() as (props: {
    userId: string | bigint;
}) => void;

const useStyles = createStyles(() => ({
    devsPill: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: tokens.colors.STAGE_CARD_PILL_BG,
        borderRadius: 32,
    },
}));

const { getUser: maybeFetchUser } = lazyDestructure(() => lookupByProps("getUser", "fetchProfile").load());

interface TitleComponentProps {
    plugin: WintryPluginInstance;
}

export default function TitleComponent({ plugin }: TitleComponentProps) {
    const styles = useStyles();
    const users: any[] = FluxUtils.useStateFromStoresArray([UserStore], () => {
        for (const author of plugin.authors ?? []) {
            maybeFetchUser(author.id); // Fetch the user if they're not already cached
        }

        return plugin.authors?.map(a => UserStore.getUser(a.id.toString()));
    });

    const { authors } = plugin;
    const authorTextNode = [];

    if (authors) {
        for (const author of authors) {
            authorTextNode.push(
                <Text onPress={() => showUserProfileActionSheet({ userId: author.id })} variant="text-md/medium">
                    {author.name}
                </Text>,
            );

            authorTextNode.push(", ");
        }

        authorTextNode.pop();
    }

    return (
        <View style={{ gap: 6, width: "80%" }}>
            <View style={{ gap: 4, flexDirection: "column-reverse" }}>
                <View>
                    <Text variant="heading-xl/semibold">{plugin.name}</Text>
                </View>
                <View style={{ flexDirection: "row", flexShrink: 1 }}>
                    {authors?.length && (
                        <View style={styles.devsPill}>
                            {users.length && (
                                <AvatarPile
                                    size="xxsmall"
                                    names={plugin.authors?.map(a => a.name)}
                                    totalCount={plugin.authors?.length}
                                >
                                    {users.map((a, i) => (
                                        <Avatar key={i} size="xxsmall" user={a} />
                                    ))}
                                </AvatarPile>
                            )}
                            <Text variant="text-md/medium">{authorTextNode}</Text>
                        </View>
                    )}
                </View>
            </View>
            {plugin.description && (
                <Text style={{ flexShrink: 1 }} color="text-muted" variant="text-md/medium">
                    {plugin.description}
                </Text>
            )}
        </View>
    );
}
