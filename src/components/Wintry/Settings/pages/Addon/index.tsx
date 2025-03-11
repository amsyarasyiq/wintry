import Callout from "@components/Wintry/Callout";
import { t } from "@i18n";
import { View } from "react-native";
import PageWrapper from "../../PageWrapper";
import { ResponsiveMasonryFlashList } from "../ResponsiveMasonryFlashList";
import AddonCard from "./AddonCard";
import { HighlightProvider } from "./SearchTermHighlight";
import type { AddonCollectionManager } from "./AddonCollectionManager";
import { isSafeModeEnabled } from "@loader";

const ItemSeparator = () => <View style={{ height: 8 }} />;

export interface Addon {
    $id: string;
    name: string;
    description: string;
    authors: { name: string }[];
}

export interface AddonPageProps<T extends Addon> {
    useCanHandleAddon: (id: string) => boolean;
    useToggler: (id: string) => [boolean, (enabled: boolean) => void];

    collectionManager: AddonCollectionManager<T, any, any>;
    onPressInfo?: (addon: T) => void;
}

export default function AddonPage<T extends Addon>(props: AddonPageProps<T>) {
    const { useFilterResults, FilterBarComponent } = props.collectionManager;
    const results = useFilterResults();

    return (
        <PageWrapper containerStyle={{ paddingHorizontal: 0 }}>
            <ResponsiveMasonryFlashList
                data={results}
                itemMinWidth={244}
                estimatedItemSize={150}
                keyExtractor={i => i.obj.$id}
                renderItem={({ item: result }) => (
                    <HighlightProvider result={result} searchTerms={props.collectionManager.searchTerms}>
                        <AddonCard<T> addon={result.obj} pageProps={props} />
                    </HighlightProvider>
                )}
                ItemSeparatorComponent={ItemSeparator}
                ListHeaderComponent={
                    <View style={{ gap: 8 }}>
                        <FilterBarComponent />
                        {isSafeModeEnabled() && (
                            <Callout variant="info" title={t.settings.plugins.safe_mode_callout()}>
                                {t.settings.plugins.safe_mode_callout_desc()}
                            </Callout>
                        )}
                    </View>
                }
                contentContainerStyle={{ paddingHorizontal: 12 }}
                ListHeaderComponentStyle={{ marginBottom: 12 }}
                ListFooterComponentStyle={{ marginVertical: 16, alignItems: "center" }}
            />
        </PageWrapper>
    );
}
