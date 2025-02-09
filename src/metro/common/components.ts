import { lazyDestructure, lazyValue } from "@utils/lazy";
import type * as t from "./types/components";
import { byProps, bySingularProp } from "@metro/new/common/filters";
import { lookup } from "@metro/new/api";
import { lookupByProps } from "@metro/new/common/wrappers";
const findSingular = (prop: string) => lazyValue(() => lookup(bySingularProp(prop)).load()[prop]);
export const findProp = (...prop: string[]) => lazyValue(() => lookup(byProps(prop)).load()[prop[0]]);

// React Native's included SafeAreaView only adds padding on iOS.
export let { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = lazyDestructure(() =>
    lookupByProps("useSafeAreaInsets").asLazy(m => ({ SafeAreaView, SafeAreaProvider, useSafeAreaInsets } = m)),
) as any;

// ActionSheet
export const ActionSheetRow = findProp("ActionSheetRow");

export const TwinButtons = findProp("TwinButtons") as t.TwinButtons;

export const PressableScale = findProp("PressableScale");

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
