import fuzzysort from "fuzzysort";
import { useMemo, useState } from "react";
import { View } from "react-native";
import PLUGINS from "#wt-plugins";
import Search, { useSearchQuery } from "../../../Search";
import PageWrapper from "../../PageWrapper";
import PluginCard from "./PluginCard";
import { ResponsiveMasonryFlashList } from "../ResponsiveMasonryFlashList";
import { Text } from "@components/Discord";
import { isPluginInternal } from "@plugins/utils";

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
                ListHeaderComponent={<Search queryRef={queryRef} />}
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
