import { lookup } from "@metro/api";
import { bySingularProp, byProps, byFilePath } from "@metro/common/filters";
import { lazyValue } from "@utils/lazy";
import type { AnyRecord } from "@utils/types";
import type { ComponentType } from "react";

const findSingular = (prop: string) => lazyValue(() => lookup(bySingularProp(prop)).load()[prop]);
const findProp = (...prop: string[]) => lazyValue(() => lookup(byProps(prop)).load()[prop[0]]);

export function getComponentFromProps<P extends AnyRecord>(
    props: string | string[],
    { singular = false } = {},
): ComponentType<P> {
    const actualProps = typeof props === "string" ? [props] : props;

    const ActualComponent = singular ? findSingular(actualProps[0]) : findProp(...actualProps);

    return ActualComponent as ComponentType<P>;
}

export function getComponentFromFilePath<P extends AnyRecord>(path: string): ComponentType<P> {
    const ActualComponent = lookup(byFilePath(path)).asLazy() as ComponentType<P>;

    return ActualComponent;
}
