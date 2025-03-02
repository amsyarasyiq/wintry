import { lazyValue } from "@utils/lazy";
import { lookupByProps } from "@metro/common/wrappers";

function getIcon(name: string): React.ComponentType<Record<string, unknown>> {
    return lazyValue(() => lookupByProps(name).load()[name]);
}

export const CirclePlusIcon = getIcon("CirclePlusIcon");
export const CircleMinusIcon = getIcon("CircleMinusIcon");
export const ArrowSmallLeftIcon = getIcon("ArrowSmallLeftIcon");
export const ActivitiesIcon = getIcon("ActivitiesIcon");
export const WrenchIcon = getIcon("WrenchIcon");
export const DownloadIcon = getIcon("DownloadIcon");
export const PuzzlePieceIcon = getIcon("PuzzlePieceIcon");
