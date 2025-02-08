import { lookup } from "@metro/new/api";
import { bySingularProp, byProps, byFilePath } from "@metro/new/common/filters";
import { lazyValue } from "@utils/lazy";
import type { AnyRecord } from "@utils/types";
import type { ComponentType } from "react";

const findSingular = (prop: string) => lazyValue(() => lookup(bySingularProp(prop)).load()[prop]);
const findProp = (...prop: string[]) => lazyValue(() => lookup(byProps(prop)).load()[prop[0]]);

export function getComponentFromProps<P extends AnyRecord>(prop: string, { singular = false } = {}): ComponentType<P> {
    const ActualComponent = singular ? findSingular(prop) : findProp(prop);

    return (props: P) => {
        return <ActualComponent {...props} />;
    };
}

export function getComponentFromFilePath<P extends AnyRecord>(path: string): ComponentType<P> {
    const ActualComponent = lookup(byFilePath(path)).asLazy() as ComponentType<P>;

    return (props: P) => {
        return <ActualComponent {...props} />;
    };
}
