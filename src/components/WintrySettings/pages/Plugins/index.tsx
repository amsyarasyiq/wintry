import fuzzysort from "fuzzysort";
import { useMemo, useState } from "react";
import { View } from "react-native";
import PLUGINS from "#wt-plugins";
import Search, { useSearchQuery } from "../../../Search";
import PageWrapper from "../../PageWrapper";
import PluginCard from "./PluginCard";
import { ResponsiveMasonryFlashList } from "../ResponsiveMasonryFlashList";
import { IconButton, Text } from "@components/Discord";
import { isPluginInternal } from "@plugins/utils";
import { findAssetId } from "@api/assets";
import ContextMenu from "@components/Discord/ContextMenu/ContextMenu";
import Callout from "@components/Callout";
import { t } from "@i18n";
import { isSafeModeEnabled } from "@stores/usePrefsStore";

const ItemSeparator = () => <View style={{ height: 8 }} />;

export default function PluginsPage() {
    const [showInternal, setShowInternal] = useState(false);
    const queryRef = useSearchQuery();

    const results = useMemo(() => {
        let plugins = Object.values(PLUGINS);
        if (!showInternal) {
            plugins = plugins.filter(p => !isPluginInternal(p));
        }

        plugins.sort((a, b) => {
            const aInternal = isPluginInternal(a);
            const bInternal = isPluginInternal(b);
            if (aInternal !== bInternal) return aInternal ? 1 : -1;

            return a.name.localeCompare(b.name);
        });

        return fuzzysort.go(queryRef.query, plugins, {
            keys: ["name", "description", w => w.authors.map(a => a.name).join(", ")],
            all: true,
        });
    }, [queryRef.query, showInternal]);

    return (
        /* "Move" the paddingHorizontal to contentContainerStyle to scroller is not included */
        <PageWrapper style={{ paddingHorizontal: 0 }}>
            <ResponsiveMasonryFlashList
                data={results}
                itemMinWidth={244} // Approximated number
                estimatedItemSize={150}
                keyExtractor={i => i.obj.$id}
                renderItem={({ item: result }) => <PluginCard result={result} item={result.obj} />}
                ItemSeparatorComponent={ItemSeparator}
                ListHeaderComponent={
                    <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <Search style={{ flexGrow: 1 }} isRound={true} queryRef={queryRef} />
                            <ContextMenu
                                items={[
                                    {
                                        label: "A-Z",
                                        iconSource: findAssetId("CheckmarkSmallBoldIcon"),
                                        action: () => {},
                                    },
                                ]}
                            >
                                {props => (
                                    <IconButton {...props} variant="tertiary" icon={findAssetId("ArrowsUpDownIcon")} />
                                )}
                            </ContextMenu>
                            <ContextMenu
                                items={[
                                    {
                                        label: "Show internal plugins",
                                        iconSource: findAssetId("CheckmarkSmallBoldIcon"),
                                        action: () => {},
                                    },
                                ]}
                            >
                                {props => (
                                    <IconButton
                                        {...props}
                                        variant="tertiary"
                                        icon={findAssetId("FiltersHorizontalIcon")}
                                    />
                                )}
                            </ContextMenu>
                        </View>
                        {isSafeModeEnabled() && (
                            <Callout variant="info" title={t.settings.plugins.safe_mode_callout()}>
                                {t.settings.plugins.safe_mode_callout_desc()}
                            </Callout>
                        )}
                    </View>
                }
                ListFooterComponent={() => {
                    if (showInternal) return null;
                    return (
                        <Text style={{ cursor: "pointer" }} color="text-link" onPress={() => setShowInternal(true)}>
                            Show internal plugins
                        </Text>
                    );
                }}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                ListHeaderComponentStyle={{ marginBottom: 12 }}
                ListFooterComponentStyle={{ marginVertical: 16, alignItems: "center" }}
            />
        </PageWrapper>
    );
}
