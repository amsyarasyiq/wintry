import { lookup } from "@metro/new/api";
import { bySingularProp, byProps, byFilePath } from "@metro/new/common/filters";
import { lazyValue } from "@utils/lazy";
import type { AnyRecord } from "@utils/types";
import type { ComponentType } from "react";

const findSingular = (prop: string) => lazyValue(() => lookup(bySingularProp(prop)).load()[prop]);
const findProp = (...prop: string[]) => lazyValue(() => lookup(byProps(prop)).load()[prop[0]]);

export function getComponentFromProps<P extends AnyRecord>(
    props: string | string[],
    { singular = false } = {},
): ComponentType<P> {
    // biome-ignore lint/style/noParameterAssign:
    props = typeof props === "string" ? [props] : props;

    const ActualComponent = singular ? findSingular(props[0]) : findProp(...props);

    return ActualComponent as ComponentType<P>;
}

export function getComponentFromFilePath<P extends AnyRecord>(path: string): ComponentType<P> {
    const ActualComponent = lookup(byFilePath(path)).asLazy() as ComponentType<P>;

    return ActualComponent;
}
