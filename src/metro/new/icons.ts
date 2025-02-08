import { byProps } from "@metro/filters";
import { lookup } from "./api";
import { lazyValue } from "@utils/lazy";

function getIcon(name: string) {
    return lazyValue(() => lookup(byProps([name])).load()[name]);
}

export const CirclePlusIcon = getIcon("CirclePlusIcon");
export const CircleMinusIcon = getIcon("CircleMinusIcon");
export const ArrowSmallLeftIcon = getIcon("ArrowSmallLeftIcon");
