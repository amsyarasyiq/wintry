import { useMemo } from "react";
import { type Asset, getAssets } from "../../../../metro/assets";
import { Card, FlashList, Text } from "../../../../metro/common/components";
import Search, { useSearchQuery } from "../../../Search";
import PageWrapper from "../../PageWrapper";

interface AssetDisplayProps {
    asset: Asset;
    start: boolean;
    end: boolean;
}

function AssetDisplay({ asset, start, end }: AssetDisplayProps) {
    return (
        <Card start={start} end={end}>
            <Text>{asset.name}</Text>
            <Text>{asset.id}</Text>
            <Text>{asset.type}</Text>
        </Card>
    );
}

export default function AssetBrowser() {
    const ref = useSearchQuery();
    const assets = useMemo(
        () => getAssets().filter(a => a.name.includes(ref.query) || a.id.toString() === ref.query),
        [ref.query],
    );

    return (
        <PageWrapper style={{ gap: 12, paddingHorizontal: 12, paddingTop: 8 }}>
            <Search queryRef={ref} />
            <FlashList
                data={assets}
                keyExtractor={item => String(item.id)}
                renderItem={({ item, index }) => (
                    <AssetDisplay asset={item} start={index === 0} end={index === assets.length - 1} />
                )}
            />
        </PageWrapper>
    );
}
