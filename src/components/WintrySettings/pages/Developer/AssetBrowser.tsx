import { useMemo, useState } from "react";
import { FlatList, Image, View } from "react-native";
import { getAssets, iterateAssets, type Asset } from "../../../../metro/assets";
import Search from "../../../Search";
import { Card, TableRow, Text } from "../../../../metro/common/components";
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
    )
}
export default function AssetBrowser() {
    const [search, setSearch] = useState("");
    const assets = useMemo(() =>
        getAssets().filter(a => a.name.includes(search) || a.id.toString() === search), [search]);

    return (
        <PageWrapper>
            <Search
                style={{ margin: 10 }}
                onChangeText={(v: string) => setSearch(v)}
            />
            <FlatList
                data={assets}
                renderItem={({ item, index }) => <AssetDisplay asset={item} start={index === 0} end={index === assets.length - 1} />}
                keyExtractor={item => item.name}
            />
        </PageWrapper>
    );
}