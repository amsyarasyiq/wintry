import { useMemo, useCallback } from "react";
import { View, useWindowDimensions } from "react-native";
import type { SetRequired } from "type-fest";
import { omit } from "es-toolkit";
import { MasonryFlashList, type MasonryFlashListProps, type MasonryListRenderItemInfo } from "@shopify/flash-list";

export function ResponsiveMasonryFlashList<T>(
    props: Omit<SetRequired<MasonryFlashListProps<T>, "data" | "renderItem">, "numColumns"> & {
        itemMinWidth: number;
    },
) {
    const minWidth = props.itemMinWidth;
    const dimensions = useWindowDimensions();

    const listProps = useMemo(() => omit(props, ["data", "renderItem"]), [props]);
    const numColumns = useMemo(
        () => Math.min(props.data!.length, Math.floor((dimensions.width - 24) / minWidth)),
        [dimensions.width, props.data, minWidth],
    );

    const renderItem = useCallback(
        (info: MasonryListRenderItemInfo<T>) => {
            const { columnIndex } = info;
            const Item = props.renderItem!;

            return (
                <View
                    style={{
                        minWidth,
                        paddingRight: columnIndex === numColumns - 1 ? 0 : 4,
                        paddingLeft: columnIndex === 0 ? 0 : 4,
                    }}
                >
                    <Item {...info} />
                </View>
            );
        },
        [numColumns, minWidth, props.renderItem],
    );

    return <MasonryFlashList data={props.data} numColumns={numColumns} renderItem={renderItem} {...listProps} />;
}
