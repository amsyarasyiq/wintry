import { lazyValue } from "@utils/lazy";
import { lookupByProps } from "@metro/new/common/wrappers";

function getIcon(name: string): React.Component<Record<string, unknown>> {
    return lazyValue(() => lookupByProps(name).load()[name]);
}

export const CirclePlusIcon = getIcon("CirclePlusIcon");
export const CircleMinusIcon = getIcon("CircleMinusIcon");
export const ArrowSmallLeftIcon = getIcon("ArrowSmallLeftIcon");
