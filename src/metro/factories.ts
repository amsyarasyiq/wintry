import type { AnyRecord } from "@utils/types";
import { moduleRegistry } from "./internal/modules";
import type { ModuleState } from "./types";

type Arg = unknown;
type Resolver = (exp: any) => any;
export type Resolvers = Array<Resolver>;

export interface FilterPredicateArg<A> {
    /**
     * Argument passed to the filter.
     */
    a: A;
    /**
     * Resolved module exports.
     */
    m: any;
    /**
     * Module state.
     */

    state: ModuleState;
    /**
     * Module ID.
     */
    id: number;
}

export const defaultResolvers: Resolvers = [exp => exp?.__esModule && exp.default, exp => exp];

export interface ModuleFilter<A, R> {
    key: string;
    resolvers: Resolvers;
    check: (id: number, exp: any) => boolean;

    __type__?: [A, R];
}

export interface ModuleFilterFactory<A extends Arg, R, O extends Record<string, unknown> = AnyRecord> {
    (args: A, options?: O): ModuleFilter<A, R>;

    stringify: (args: A, options: O) => string;
    getResolvers: (a: A, options: O) => Resolvers;
}

export type ModuleFilterFactoryProps<A extends Arg, O extends Record<string, unknown> = AnyRecord> = {
    filter: (arg: FilterPredicateArg<A>, options: O) => boolean;
    stringify: (arg: A, options: O) => string;
    getResolvers?: (arg: A, options: O) => Resolvers;
};

export function createModuleFilter<A extends Arg, R, O extends Record<string, unknown> = AnyRecord>({
    filter,
    stringify,
    getResolvers = () => defaultResolvers,
}: ModuleFilterFactoryProps<A, O>): ModuleFilterFactory<A, R, O> {
    const moduleFilter = (arg: A, options: O = {} as O): ModuleFilter<A, R> => {
        const resolvers = getResolvers(arg, options);

        return {
            key: stringify(arg, options),
            resolvers,

            check: (id: number, exports: any) => {
                return !!filter(
                    {
                        id,
                        a: arg,
                        m: exports,
                        state: moduleRegistry.get(id)!,
                    },
                    options,
                );
            },
        };
    };

    return Object.assign(moduleFilter, {
        stringify,
        getResolvers,
    });
}

export type InteropOption = {
    /**
     * Whether to return for ES module default exports or the whole module.
     * @default true
     */
    returnEsmDefault?: boolean;
    /**
     * Whether to check for ES module default exports. This could potentially help making the filter more efficient when set.
     * - If `false`, the check will be completely skipped.
     * - If `true`, **only** the default export is checked.
     * - If `undefined`, the default behavior is used (check with the default export if it's an ES module first, if false then check with the actual module).
     * @default undefined
     */
    checkEsmDefault?: boolean;
};

/**
 * Handles filtering for the ES module default export interop.
 */
export function withInteropOptions<A extends Arg, O extends Record<string, unknown> = InteropOption>(
    props: ModuleFilterFactoryProps<A, O & InteropOption>,
): ModuleFilterFactoryProps<A, O & InteropOption> {
    return {
        filter: (arg, options) => {
            const { checkEsmDefault, returnEsmDefault = true } = options;

            // Read the comment in the `getResolvers` function for more information.
            if (checkEsmDefault !== false && returnEsmDefault === false && arg.m?.__esModule && arg.m.default) {
                const res = props.filter({ ...arg, m: arg.state.module?.exports?.default }, options);
                if (res || checkEsmDefault === true) return res;
            }

            return props.filter(arg, options);
        },
        stringify: (arg, options) => {
            const VERSION = 1;
            const boolToNum = (bool: boolean | undefined) => (bool === true ? 2 : bool === false ? 1 : 0);

            let str = props.stringify(arg, options);
            str += `::interop:${VERSION}:${boolToNum(options.checkEsmDefault)}:${boolToNum(options.returnEsmDefault)}`;

            return str;
        },
        getResolvers: (arg, options) => {
            const { checkEsmDefault, returnEsmDefault = true } = options;

            // We need the resolver to return the whole module if the caller wants it (hence the returnEsmDefault === false check)
            // But the default export will not be checked, even if the checkEsmDefault !== false.
            // For this case, our filter function will handle the check for default exports while allowing the resolver to return the whole module.
            if (checkEsmDefault === false || returnEsmDefault === false) {
                return [exp => exp];
            }

            if (checkEsmDefault === true) {
                return [exp => exp.__esModule && exp.default];
            }

            return props.getResolvers?.(arg, options) ?? defaultResolvers;
        },
    };
}
