import { SynchronousPromise } from "synchronous-promise";
import type { ModuleFilter } from "./filters";
import { waitFor } from "./internal/modules";
import { LazyModuleContext } from "./lazy";
import { findIdAndResolved } from "./api";

export class SingleMetroModule<A, R, O> {
    _id?: number;
    _module?: R;

    _lazy?: LazyModuleContext<A, R, O>;
    _lazyCallback?: (exports: any) => void;

    filter: ModuleFilter<A, R, O>;

    constructor(filter: ModuleFilter<A, R, O>) {
        this.filter = filter;
    }

    wait(callback: (exports: R) => void): () => void {
        return waitFor(this.filter, exp => callback(exp));
    }

    load<T = R>(): T {
        if (!this._module) {
            const ret = findIdAndResolved(this.filter);

            if (!ret) {
                throw new Error(`Module ${this.filter.key} returned unexpected ${typeof this._module}`);
            }

            this._id = ret.id;
            this._module = ret.resolved;
        }

        return this._module as unknown as T;
    }

    await(): SynchronousPromise<R> {
        return new SynchronousPromise<R>(resolve => {
            this.wait(resolve);
        });
    }

    asLazy(cb?: typeof this._lazyCallback): R extends object ? R : any {
        if (cb) this._lazyCallback = cb;
        this._lazy ??= new LazyModuleContext(this);

        // @ts-expect-error
        return this._lazy.proxy();
    }
}
