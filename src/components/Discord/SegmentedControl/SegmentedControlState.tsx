import { lookupByProps } from "@metro/common/wrappers";
import type { MutableRefObject, RefObject } from "react";
import type { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

export interface SegmentedControlItem {
    id: string;
    label: string;
    page: JSX.Element | null;
}

export interface SegmentedControlStateArgs {
    items: SegmentedControlItem[];
    pageWidth: number;
    defaultIndex?: number;
    onSetActiveIndex?: (index: number) => void;
}

export interface SegmentedControlState {
    activeIndex: SharedValue<number>;
    pagerRef: RefObject<View>;
    scrollTarget: SharedValue<number>;
    scrollOverflow: SharedValue<number>;
    scrollOffset: SharedValue<number>;
    items: SegmentedControlItem[];
    itemDimensions: SharedValue<unknown[]>;
    pageWidth: number;
    pressedIndex: SharedValue<number>;
    onPageChangeRef: MutableRefObject<unknown>;
    setActiveIndex: (index: number) => void;
    setItemDimensions: (index: number, dimensions: unknown[]) => void;
    useReducedMotion: boolean;
}

const module = lookupByProps("useSegmentedControlState");

export const useSegmentedControlState = (args: SegmentedControlStateArgs): SegmentedControlState => {
    return module.load().useSegmentedControlState(args);
};
