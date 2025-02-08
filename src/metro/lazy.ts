import { _patcherDelaySymbol } from "../patcher/patcher";
import { lazyValue } from "@utils/lazy";
import { findImmediate } from "./legacy_api";
import { waitFor } from "./internal/modules";
import type { ModuleFilter } from "./factories";

/** @internal */
const _lazyContextSymbol = Symbol.for("wintry.metro.lazyContext");
const _lazyContexts = new WeakMap<any, LazyModuleContext>();

export class LazyModuleContext<A = unknown, R = unknown> {
    cache: R | undefined = undefined;

    constructor(public filter: ModuleFilter<A, R>) {}

    wait(callback: (exports: any) => void): () => void {
        return waitFor(this.filter, exp => callback(exp));
    }

    eagerLoad(): R {
        if (!this.cache) {
            this.cache = findImmediate(this.filter);

            if (!this.cache) {
                throw new Error(`Module ${this.filter.key} returned unexpected ${typeof this.cache}`);
            }

            if (typeof this.cache === "function" || typeof this.cache === "object") {
                _lazyContexts.set(this.cache, this);
            }
        }

        return this.cache;
    }

    get [Symbol.toStringTag]() {
        return "LazyModuleContext";
    }
}

export function createLazyModule<A, R>(filter: ModuleFilter<A, R>): R {
    const context: LazyModuleContext<A, R> = new LazyModuleContext(filter);

    const proxy = lazyValue(() => context.eagerLoad(), {
        exemptedEntries: {
            [_lazyContextSymbol]: context,
            [_patcherDelaySymbol]: (cb: (exports: any) => void) => context.wait(cb),
        },
    });

    _lazyContexts.set(proxy, context);
    context.wait(exp => (context.cache = exp));

    return proxy;
}

export function getLazyContext<A, R>(proxy: any): LazyModuleContext<A, R> | void {
    return _lazyContexts.get(proxy) as LazyModuleContext<A, R>;
}
