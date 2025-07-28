import { waitFor } from "./internal/modules";
import type { ModuleFilter } from "./filters";
import type { SingleMetroModule } from "./module";
import { lazyValue } from "@utils/lazy";
import { _patcherDelaySymbol } from "@patcher/patcher";

export class LazyModuleContext<A = unknown, R = unknown, O = unknown> {
    static ProxySymbol = Symbol.for("wintry.metro.lazyContext");
    static ProxyMap = new WeakMap<any, LazyModuleContext<any, any, any>>();

    private _proxy: R | undefined;

    filter: ModuleFilter<A, R, O>;
    module: SingleMetroModule<A, R, O>;

    constructor(module: SingleMetroModule<A, R, O>) {
        this.module = module;
        this.filter = module?.filter;
    }

    get cache(): R | undefined {
        return this.module._module;
    }

    set cache(value: R) {
        this.module._lazyCallback?.(value);
        this.module._lazyCallback = undefined;

        this.module._module = value;
    }

    wait(callback: (exports: R) => void): () => void {
        return waitFor(this.filter, exp => callback(exp));
    }

    proxy(): R {
        if (this._proxy) {
            return this._proxy;
        }

        const proxy = lazyValue(() => this.load(), {
            exemptedEntries: {
                ...(__DEV__ ? { __LAZY_MODULE__: true } : null),
                [LazyModuleContext.ProxySymbol]: this,
                [_patcherDelaySymbol]: (cb: (exports: any) => void) => this.wait(cb),
            },
        });

        LazyModuleContext.ProxyMap.set(proxy, this);
        this.wait(exp => (this.cache = exp));

        return (this._proxy = proxy);
    }

    load(): R {
        if (!this.cache) {
            const cache = (this.cache = this.module.load());

            if (typeof cache === "function" || typeof cache === "object") {
                LazyModuleContext.ProxyMap.set(this.cache, this);
            }
        }

        return this.cache!;
    }

    get [Symbol.toStringTag]() {
        return "LazyModuleContext";
    }
}
