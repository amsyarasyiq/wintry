import * as patchers from "./index";

type DisposableFn = (...props: any[]) => () => unknown;

export type ContextualPatcher = ReturnType<typeof createContextualPatcher>;

export function createContextualPatcher({ pluginName }: { pluginName: string }) {
    let disposed = false;
    const unpatches: (() => void)[] = [];

    function shimDisposableFn<F extends DisposableFn>(unpatches: (() => void)[], f: F): F {
        const base = ((...props: Parameters<F>) => {
            if (disposed) return () => true;
            const up = f(...props);
            unpatches.push(up);
            return up;
        }) as F;

        for (const key in f)
            if (typeof f[key] === "function") {
                (base as any)[key] = shimDisposableFn(unpatches, f[key] as DisposableFn);
            }

        return base;
    }

    return {
        pluginName: pluginName,

        before: shimDisposableFn(unpatches, patchers.before),
        instead: shimDisposableFn(unpatches, patchers.instead),
        after: shimDisposableFn(unpatches, patchers.after),

        /**
         * Patchers which are not disposed when the context is disposed,
         * make sure to dispose them manually.
         */
        detached: patchers, // TODO: Still retain context

        /**
         * Add a disposer to the context, which will be called when the context is disposed
         *
         * The callback will be called immediately if the context is already disposed
         * @param cbs Callbacks to call when the context is disposed
         */
        addDisposer(...cbs: Array<() => void | boolean>) {
            if (disposed) {
                // Call all callbacks immediately
                for (const cb of cbs) {
                    if (typeof cb === "function") cb();
                }
            } else {
                unpatches.push(...cbs.map(cb => () => !!cb()));
            }
        },

        dispose() {
            disposed = true;
            for (const unpatch of unpatches) {
                unpatch();
            }
        },
    };
}
