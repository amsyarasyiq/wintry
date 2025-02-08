import { byFilePath, byName, byProps } from "@metro/new/common/filters";
import { lookup } from "../api";
import type { InteropOption } from "@metro/filters";

export function lookupByProps<T extends string>(...props: T[]) {
    return lookup(byProps<T>(props));
}

export function lookupByName<T extends string>(name: T) {
    return lookup(byName(name));
}

export function lookupByFilePath(filePath: string, options?: InteropOption) {
    return lookup(byFilePath(filePath, options));
}
