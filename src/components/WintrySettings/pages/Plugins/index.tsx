import fuzzysort from "fuzzysort";
import { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { MasonryFlashList } from "../../../../metro/common/components";
import { PLUGINS } from "../../../../plugins";
import Search, { useSearchQuery } from "../../../Search";
import PageWrapper from "../../PageWrapper";
import PluginCard from "./PluginCard";

export default function PluginsPage() {
    const queryRef = useSearchQuery();

    const results = useMemo(() => {
        return fuzzysort.go(queryRef.query, Object.values(PLUGINS), {
            keys: ["name", "description", w => w.authors.map(a => a.name).join(", ")],
            all: true,
        });
    }, [queryRef.query]);

    const minWidth = 244; // Magic number (literally)
    const dimensions = useWindowDimensions();
    const numColumns = Math.min(results.length, Math.floor((dimensions.width - 24) / minWidth));

    return (
        <PageWrapper style={{ gap: 6 }}>
            <Search queryRef={queryRef} />
            <MasonryFlashList
                data={results}
                numColumns={numColumns}
                estimatedItemSize={150}
                keyExtractor={i => i.obj.id}
                renderItem={({ item: result, columnIndex }) => (
                    <View
                        style={{
                            minWidth,
                            paddingRight: columnIndex === numColumns - 1 ? 0 : 4,
                            paddingLeft: columnIndex === 0 ? 0 : 4,
                        }}
                    >
                        <PluginCard result={result} item={result.obj} />
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
        </PageWrapper>
    );
}
