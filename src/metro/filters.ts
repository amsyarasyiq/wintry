import type { AnyRecord } from "@utils/types";
import { moduleRegistry } from "./internal/registry";
import type { ModuleState } from "./types";

type Resolver = (exp: any) => any;
export type Resolvers = Array<Resolver>;

export type FilterPredicateArg<A> = [
    /**
     * Argument passed to the filter.
     */
    args: A,
    /**
     * Resolved module exports.
     */
    module: any,
    /**
     * Module state.
     */

    state: ModuleState,
];

export const defaultResolvers: Resolvers = [exp => exp?.__esModule && exp.default, exp => exp];

export interface ModuleFilter<A, R, O> {
    key: string;
    resolvers: Resolvers;
    check: (id: number, exp: any) => boolean;
    factory: ModuleFilterFactory<A, R, O>;
}

export interface ModuleFilterFactory<A, R, O = AnyRecord> {
    (args: A, options?: O): ModuleFilter<A, R, O>;

    stringify: (args: A, options: O) => string;
    getResolvers: (a: A, options: O) => Resolvers;
}

export type ModuleFilterFactoryProps<A, O = AnyRecord> = {
    filter: (arg: FilterPredicateArg<A>, options: O) => boolean;
    stringify: (arg: A, options: O) => string;
    getResolvers?: (arg: A, options: O) => Resolvers;
};

export function createModuleFilter<A, R, O = AnyRecord>({
    filter,
    stringify,
    getResolvers = () => defaultResolvers,
}: ModuleFilterFactoryProps<A, O>): ModuleFilterFactory<A, R, O> {
    const factory = Object.assign(
        (arg: A, options: O = {} as O): ModuleFilter<A, R, O> => {
            const resolvers = getResolvers(arg, options);

            return {
                key: stringify(arg, options),
                resolvers,
                factory: moduleFilter,

                check: (id: number, exports: any) => {
                    return !!filter([arg, exports, moduleRegistry.get(id)!], options);
                },
            };
        },
        {
            stringify,
            getResolvers,
        },
    );

    const moduleFilter = factory as ModuleFilterFactory<A, R, O>;
    return moduleFilter;
}

export type InteropOption = {
    /**
     * Whether to return for ES module default exports or the whole module.
     * - If `true`, returns ES module default exports (if available, otherwise the whole module)
     * - If `false`, returns the entire module
     *
     * @default true
     */
    returnEsmDefault?: boolean;

    /**
     * Whether to check for ES module default exports.
     * Controls filtering behavior for potential performance optimization.
     *
     * - If `false`: Skip default export checks completely
     * - If `true`: Check only the default export
     * - If `undefined`: Use default behavior (check default export first for ES modules,
     *                   fall back to module check if needed)
     *
     * @default undefined
     */
    checkEsmDefault?: boolean;
};

/**
 * Handles filtering for the ES module default export interop.
 */
export function withInteropOptions<A, O = InteropOption>(
    props: ModuleFilterFactoryProps<A, O & InteropOption>,
): ModuleFilterFactoryProps<A, O & InteropOption> {
    return {
        filter: (arg, options) => {
            const { checkEsmDefault, returnEsmDefault = true } = options;

            // Read the comment in the `getResolvers` function for more information.
            if (checkEsmDefault !== false && returnEsmDefault === false && arg[1]?.__esModule && arg[1].default) {
                const res = props.filter([arg[0], arg[2].module?.exports?.default, arg[2]], options);
                if (res || checkEsmDefault === true) return res;
            }

            return props.filter(arg, options);
        },
        stringify: (arg, options) => {
            const VERSION = 1;
            const boolToNum = (bool?: boolean) => (bool ? 2 : bool === false ? 1 : 0);

            return `${props.stringify(arg, options)}::interop:${VERSION}:${boolToNum(options.checkEsmDefault)}:${boolToNum(options.returnEsmDefault)}`;
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
