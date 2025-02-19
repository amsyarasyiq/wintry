import fuzzysort from "fuzzysort";
import { useMemo } from "react";
import { View } from "react-native";
import PLUGINS from "#wt-plugins";
import Search, { useSearchQuery } from "../../../Search";
import PageWrapper from "../../PageWrapper";
import PluginCard from "./PluginCard";
import { ResponsiveMasonryFlashList } from "../ResponsiveMasonryFlashList";

export default function PluginsPage() {
    const queryRef = useSearchQuery();

    const results = useMemo(() => {
        return fuzzysort.go(queryRef.query, Object.values(PLUGINS), {
            keys: ["name", "description", w => w.authors.map(a => a.name).join(", ")],
            all: true,
        });
    }, [queryRef.query]);

    const ItemSeparator = () => <View style={{ height: 8 }} />;

    return (
        <PageWrapper style={{ gap: 6 }}>
            <Search queryRef={queryRef} />
            <ResponsiveMasonryFlashList
                data={results}
                itemMinWidth={244} // Approximated number
                estimatedItemSize={150}
                keyExtractor={i => i.obj.id}
                renderItem={({ item: result }) => <PluginCard result={result} item={result.obj} />}
                ItemSeparatorComponent={ItemSeparator}
            />
        </PageWrapper>
    );
}
