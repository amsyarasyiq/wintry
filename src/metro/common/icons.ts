import { lookupByProps } from "@metro/common/wrappers";
import { lazyValue } from "@utils/lazy";

function getIcon(name: string): React.ComponentType<Record<string, unknown>> {
    return lazyValue(() => lookupByProps(name).load()[name]);
}

export const MagnifyingGlassIcon = getIcon("MagnifyingGlassIcon");
export const CirclePlusIcon = getIcon("CirclePlusIcon");
export const CircleMinusIcon = getIcon("CircleMinusIcon");
export const ArrowSmallLeftIcon = getIcon("ArrowSmallLeftIcon");
export const ActivitiesIcon = getIcon("ActivitiesIcon");
export const WrenchIcon = getIcon("WrenchIcon");
export const DownloadIcon = getIcon("DownloadIcon");
export const PaintPaletteIcon = getIcon("PaintPaletteIcon");
export const PuzzlePieceIcon = getIcon("PuzzlePieceIcon");
export const CircleInformationIcon = getIcon("CircleInformationIcon");
export const CircleCheckIcon = getIcon("CircleCheckIcon");
export const WarningIcon = getIcon("WarningIcon");
