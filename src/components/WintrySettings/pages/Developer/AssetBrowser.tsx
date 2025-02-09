import { useMemo } from "react";
import { type Asset, getAssets } from "@metro/assets";
import { Image, View, useWindowDimensions } from "react-native";
import { showSheet } from "@components/utils/sheets";
import Search, { useSearchQuery } from "@components/Search";
import PageWrapper from "@components/WintrySettings/PageWrapper";
import { FlashList } from "@shopify/flash-list";
import { Stack, TableRow, TableRowGroup } from "@components/Discord";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";

// Constants
const REDESIGN_ICON_PATH = "/assets/design/components/Icon/native/redesign/generated/images";
const IMAGE_TYPES = ["png", "jpg", "jpeg", "bmp", "gif", "webp", "psd", "svg", "tiff", "ktx"];
const DEFAULT_IMAGE_SIZE = 48;

// Types
interface AssetDisplayProps {
    asset: Asset;
    start: boolean;
    end: boolean;
}

const isAssetTypeAnImage = (type: string): boolean => IMAGE_TYPES.includes(type);
const isRedesignIcon = (path: string): boolean => path === REDESIGN_ICON_PATH;

const BasicAssetDisplay = ({ asset, start, end }: AssetDisplayProps) => (
    <TableRow label={asset.name} subLabel={`${asset.id} | ${asset.type}`} start={start} end={end} />
);

const ImageAssetDisplay = ({ asset, start, end }: AssetDisplayProps) => (
    <TableRow
        label={asset.name}
        subLabel={`${asset.id} | ${asset.type}`}
        start={start}
        end={end}
        onPress={() => showSheet("ImageAssetPreviewer", ImageAssetPreviewer, { asset })}
        trailing={
            <Image
                source={asset.id}
                style={{
                    width: Math.min(asset.width ?? DEFAULT_IMAGE_SIZE, DEFAULT_IMAGE_SIZE),
                    height: Math.min(asset.height ?? DEFAULT_IMAGE_SIZE, DEFAULT_IMAGE_SIZE),
                }}
                resizeMode="contain"
            />
        }
    />
);

const AssetDisplay = (props: AssetDisplayProps) =>
    isAssetTypeAnImage(props.asset.type) ? <ImageAssetDisplay {...props} /> : <BasicAssetDisplay {...props} />;

const ImageAssetPreviewer = ({ asset }: { asset: Asset }) => {
    const width = useWindowDimensions().width - 24;
    const imageSize = {
        width: Math.min(width, asset.width ?? DEFAULT_IMAGE_SIZE),
        height: Math.min(width, asset.height ?? DEFAULT_IMAGE_SIZE),
    };

    return (
        <BottomSheet contentStyles={{ paddingHorizontal: 16 }}>
            <Stack>
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                    <Image source={asset.id} style={imageSize} resizeMode="contain" />
                </View>
                <TableRowGroup title="Details">
                    <TableRow
                        label="ID"
                        subLabel="Asset IDs are runtime specific. Do not hardcode these IDs!"
                        trailing={<TableRow.TrailingText text={String(asset.id)} />}
                    />
                    <TableRow label="Type" trailing={<TableRow.TrailingText text={asset.type} />} />
                    <TableRow
                        label="Size"
                        trailing={<TableRow.TrailingText text={`${asset.width}x${asset.height}`} />}
                    />
                </TableRowGroup>
            </Stack>
        </BottomSheet>
    );
};

const sortAssets = (assets: Asset[]): Asset[] =>
    assets.sort((a, b) =>
        isAssetTypeAnImage(a.type) === isAssetTypeAnImage(b.type) ? 0 : isAssetTypeAnImage(a.type) ? -1 : 1,
    );

export default function AssetBrowser() {
    const ref = useSearchQuery();
    const assets = useMemo(
        () =>
            sortAssets(getAssets()).filter(
                a => a.name.toLowerCase().includes(ref.query) || a.id.toString() === ref.query,
            ),
        [ref.query],
    );

    return (
        <PageWrapper style={{ gap: 12, paddingHorizontal: 12, paddingTop: 8 }}>
            <Search queryRef={ref} />
            <FlashList
                data={assets}
                estimatedItemSize={73}
                keyExtractor={item => String(item.id)}
                renderItem={({ item, index }) => (
                    <AssetDisplay asset={item} start={index === 0} end={index === assets.length - 1} />
                )}
            />
        </PageWrapper>
    );
}
