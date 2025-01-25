import type { FlashListProps, Masonry } from "@shopify/flash-list";
import { lazyDestructure, lazyValue } from "@utils/lazy";
import { find, findByProps } from "../api";
import { createFilterDefinition } from "../factories";

import type { ReactElement } from "react";
import type * as t from "./types/components";

const bySingularProp = createFilterDefinition<[string]>(
    ([prop], m) => m[prop] && Object.keys(m).length === 1,
    prop => `bunny.metro.common.components.bySingularProp(${prop})`,
);

const findSingular = (prop: string) => lazyValue(() => find(bySingularProp(prop))?.[prop]);
const findProp = (...prop: string[]) => lazyValue(() => findByProps(...prop)[prop[0]]);

// React Native's included SafeAreaView only adds padding on iOS.
export const { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = lazyDestructure(() =>
    findByProps("useSafeAreaInsets"),
);

// ActionSheet
export const ActionSheetRow = findProp("ActionSheetRow");

// Buttons
export const Button = findSingular("Button") as t.Button;
export const TwinButtons = findProp("TwinButtons") as t.TwinButtons;
export const IconButton = findSingular("IconButton") as t.IconButton;
export const RowButton = findProp("RowButton") as t.RowButton;

export const PressableScale = findProp("PressableScale");

// Tables
export const TableRow = findProp("TableRow") as t.TableRow;
export const TableRowIcon = findProp("TableRowIcon") as t.TableRowIcon;
export const TableRowTrailingText = findProp("TableRowTrailingText") as t.TableRowTrailingText;
export const TableRowGroup = findProp("TableRowGroup") as t.TableRowGroup;
export const TableRadioGroup = findProp("TableRadioGroup") as t.TableRadioGroup;
export const TableRadioRow = findProp("TableRadioRow") as t.TableRadioRow;
export const TableSwitchRow = findProp("TableSwitchRow") as t.TableSwitchRow;
export const TableCheckboxRow = findProp("TableCheckboxRow") as t.TableCheckboxRow;

export const TableSwitch = findSingular("FormSwitch");
export const TableRadio = findSingular("FormRadio");
export const TableCheckbox = findSingular("FormCheckbox");

// Slider
export const Slider = findProp("Slider") as t.Slider;

// This is oddly required by some newer components like TableRadioGroup
export const RedesignCompat = findProp("RedesignCompat");

export const FormSwitch = findSingular("FormSwitch");
export const FormRadio = findSingular("FormRadio");
export const FormCheckbox = findSingular("FormCheckbox");

// Card
export const Card = findProp("Card");


// Alert
export const AlertModal = findProp("AlertModal");
export const AlertActionButton = findProp("AlertActionButton");
export const AlertActions = findProp("AlertActions");

// Pile
export const AvatarPile = findSingular("AvatarPile");

// Misc.
export const ContextMenu = findProp("ContextMenu") as t.ContextMenu;
export const Stack = findProp("Stack") as t.Stack;
export const Avatar = findProp("default", "AvatarSizes", "getStatusSize");

// Inputs
export const TextInput = findSingular("TextInput") as t.TextInput;
export const TextArea = findSingular("TextArea");

// SegmentedControl
export const SegmentedControl = findProp("SegmentedControl") as t.SegmentedControl;
export const SegmentedControlPages = findProp("SegmentedControlPages") as t.SegmentedControlPages;
export const useSegmentedControlState = findSingular("useSegmentedControlState") as (
    arg: t.SegmentedControlStateArgs,
) => t.SegmentedControlState;
export const CompatSegmentedControl = findProp("CompatSegmentedControl") as t.CompatSegmentedControl;

export const FloatingActionButton = findProp("FloatingActionButton") as t.FloatingActionButton;
export const ActionSheet = findProp("ActionSheet") as t.ActionSheet;
export const BottomSheetTitleHeader = findProp("BottomSheetTitleHeader");

export const Text = findProp("Text", "LegacyText") as t.Text;

export const FlashList = findProp("FlashList") as <T>(props: FlashListProps<T>) => ReactElement;
export const MasonryFlashList = findProp("MasonryFlashList") as <T>(
    props: Masonry.MasonryFlashListProps<T>,
) => ReactElement;
