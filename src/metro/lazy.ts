import { proxyLazy } from "../utils/lazy";
import { findImmediate } from "./api";
import { waitFor } from "./internal/modules";
import type { FilterFn, LazyModuleContext } from "./types";

/** @internal */
export const _lazyContextSymbol = Symbol.for("wintry.metro.lazyContext");

const _lazyContexts = new WeakMap<any, LazyModuleContext>();

export function getLazyContext<A extends unknown[]>(proxy: any): LazyModuleContext<A> | void {
    return _lazyContexts.get(proxy) as unknown as LazyModuleContext<A>;
}

export function createLazyModule<A extends unknown[]>(filter: FilterFn<A>) {
    let cache: any = undefined;

    const context: LazyModuleContext<A> = {
        filter,
        getExports(callback: (exports: any) => void) {
            if (cache) {
                callback(cache);
                return () => void 0;
            }

            return this.subscribe(callback);
        },
        subscribe(callback: (exports: any) => void) {
            return waitFor(filter, exp => callback(exp));
        },
        get cache() {
            return cache;
        },
        forceLoad() {
            if (!cache) {
                cache = findImmediate(filter);
                console.log(`Forced load of ${filter.uniq} (id ${context.moduleId ?? "unknown"})`);
                if (!cache) throw new Error(`${filter.uniq} is ${typeof cache}! (id ${context.moduleId ?? "unknown"})`);
            }

            return cache;
        },
    };

    const proxy = proxyLazy(() => context.forceLoad(), {
        exemptedEntries: {
            [_lazyContextSymbol]: context,
            // [_patcherDelaySymbol]: (cb: (exports: any) => void) => context.getExports(cb),
        },
    });

    _lazyContexts.set(proxy, context as LazyModuleContext<any>);

    context.subscribe(exp => (cache = exp));

    return proxy;
}
