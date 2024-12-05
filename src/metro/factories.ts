import type { FilterCheckDef, FilterDefinition, ModuleExports } from "./types";

export function createFilterDefinition<A extends unknown[]>(
    fn: FilterCheckDef<A>,
    buildUniqueIdentifier: (args: A) => string,
): FilterDefinition<A> {
    function createHolder<T extends (...args: any[]) => any>(func: T, args: A, raw: boolean) {
        const uniq = [raw && "raw::", buildUniqueIdentifier(args)].filter(Boolean).join("");

        return Object.assign(func, {
            filter: fn,
            raw,
            uniq,
        });
    }

    const curry =
        (raw: boolean) =>
        (...args: A) => {
            return createHolder(
                (m: ModuleExports, id: number, defaultCheck: boolean) => {
                    return fn(args, m, id, defaultCheck);
                },
                args,
                raw,
            );
        };

    return Object.assign(curry(false), {
        raw: curry(true),
        buildUniq: buildUniqueIdentifier,
    });
}

export function createSimpleFilter(filter: (m: ModuleExports) => boolean, uniq: string) {
    return createFilterDefinition(
        (_, m) => filter(m),
        () => `dynamic::${uniq}`,
    )();
}
