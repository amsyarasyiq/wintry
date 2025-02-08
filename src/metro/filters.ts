import type { AnyRecord } from "@utils/types";
import {
    type ModuleFilter,
    type ModuleFilterFactory,
    type InteropOption,
    createModuleFilter,
    withInteropOptions,
} from "./factories";

type Filter<F> = F extends (...args: any[]) => ModuleFilter<infer A, infer R> ? F & ModuleFilterFactory<A, R> : never;

type ByProps = <T extends string>(props: T[], options?: InteropOption) => ModuleFilter<T[], AnyRecord & Record<T, any>>;

export const byProps = createModuleFilter(
    withInteropOptions<string[]>({
        filter: ({ a: props, m }) => (props.length === 1 ? m[props[0]] : props.every(p => m[p])),
        stringify: arg => `byProps([${arg.join(",")}])`,
    }),
) as Filter<ByProps>;

type ByName = <T extends string>(
    name: T,
    options?: InteropOption,
) => ModuleFilter<T, AnyRecord & ((...args: unknown[]) => any) & { name: T }>;

// TODO: consider adding a check for the function type
export const byName = createModuleFilter(
    withInteropOptions<string>({
        filter: ({ a: name, m }) => typeof m === "function" && m.name === name,
        stringify: arg => `byName(${arg})`,
    }),
) as Filter<ByName>;

type ByDisplayName = <T extends string>(
    displayName: T,
    options?: InteropOption,
) => ModuleFilter<T, AnyRecord & { displayName: T }>;

export const byDisplayName = createModuleFilter(
    withInteropOptions<string>({
        filter: ({ a: displayName, m }) => m.displayName === displayName,
        stringify: arg => `byDisplayName(${arg})`,
    }),
) as Filter<ByDisplayName>;

type ByTypeName = <T extends string>(
    typeName: T,
    options?: InteropOption,
) => ModuleFilter<T, AnyRecord & { type: { name: T } }>;

export const byTypeName = createModuleFilter(
    withInteropOptions<string>({
        filter: ({ a: typeName, m }) => m.type?.name === typeName,
        stringify: arg => `byTypeName(${arg})`,
    }),
) as Filter<ByTypeName>;

type ByStoreName = <T extends string>(
    name: T,
    options?: InteropOption,
) => ModuleFilter<T, AnyRecord & { getName: () => T }>;

export const byStoreName = createModuleFilter(
    withInteropOptions<string>({
        filter: ({ a: name, m }) => m.constructor?.displayName === name && m.getName() === name,
        stringify: arg => `byStoreName(${arg})`,
    }),
) as Filter<ByStoreName>;

type ByFilePath = <T extends string>(path: T, options?: InteropOption) => ModuleFilter<T, AnyRecord>;

export const byFilePath = createModuleFilter(
    withInteropOptions<string>({
        filter: ({ a: path, state }) => state.meta.filePath === path,
        stringify: arg => `byFilePath(${arg})`,
    }),
) as Filter<ByFilePath>;

type BySingularProp = <T extends string>(prop: T) => ModuleFilter<T, AnyRecord & Record<T, any>>;

export const bySingularProp = createModuleFilter(
    withInteropOptions<string>({
        filter: ({ a: prop, m }) => m[prop] && Object.keys(m).length === 1,
        stringify: arg => `bySingularProp(${arg})`,
    }),
) as Filter<BySingularProp>;
