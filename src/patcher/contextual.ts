import "no-expose";

import * as patchers from "./index";

type DisposableFn = (...props: any[]) => () => unknown;

export interface ContextualPatcher {
    readonly id: string;

    readonly parent?: ContextualPatcher;
    readonly children: ContextualPatcher[];

    before: typeof patchers.before;
    instead: typeof patchers.instead;
    after: typeof patchers.after;

    /**
     * Patchers which are not disposed when the context is disposed,
     * make sure to dispose them manually.
     */
    detached: typeof patchers;

    /**
     * Whether the context has been disposed. If true, all patchers will be no-ops
     */
    disposed: boolean;

    /**
     * Add a disposer to the context, which will be called when the context is disposed
     *
     * The callback will be called immediately if the context is already disposed
     * @param cbs Callbacks to call when the context is disposed
     */
    attachDisposer(...cbs: Array<() => void | boolean>): void;

    /**
     * Dispose the context and all its children
     */
    dispose(): void;

    /**
     * Disposes the context and all its children, then reuses the context
     */
    reuse(): void;

    /**
     * Create a child context
     */
    createChild(options: ContextualPatcherOptions): ContextualPatcher;
}

interface ContextualPatcherOptions {
    id: string;
}

export function createContextualPatcher({ id }: ContextualPatcherOptions): ContextualPatcher {
    const unpatches: (() => void)[] = [];

    function shimDisposableFn<F extends DisposableFn>(f: F): F {
        const base = ((...props: Parameters<F>) => {
            if (contextualPatcher.disposed) return () => true;

            const up = f(...props);
            unpatches.push(up);
            return up;
        }) as F;

        for (const key in f)
            if (typeof f[key] === "function") {
                (base as any)[key] = shimDisposableFn(f[key] as DisposableFn);
            }

        return base;
    }

    const contextualPatcher: ContextualPatcher = {
        id,

        children: [],

        before: shimDisposableFn(patchers.before),
        instead: shimDisposableFn(patchers.instead),
        after: shimDisposableFn(patchers.after),

        detached: patchers, // TODO: Still retain context

        disposed: false,

        attachDisposer(...cbs: Array<() => void | boolean>) {
            if (contextualPatcher.disposed) {
                // Call all callbacks immediately
                for (const cb of cbs) {
                    if (typeof cb === "function") cb();
                }
            } else {
                unpatches.push(...cbs.map(cb => () => !!cb()));
            }
        },

        dispose() {
            contextualPatcher.disposed = true;
            for (const unpatch of unpatches) {
                unpatch();
            }

            // Dispose children
            for (const child of this.children) {
                child.dispose();
            }
        },

        reuse() {
            this.dispose(); // Unpatch everything just in case
            contextualPatcher.disposed = false;

            // Reuse children
            for (const child of this.children) {
                child.reuse();
            }
        },

        createChild(options: ContextualPatcherOptions) {
            const patcher = createContextualPatcher({ ...options, id: `${id}/${options.id}` });

            // @ts-expect-error - Readonly property, but this is fine これは大丈夫です
            patcher.parent = this;

            this.children.push(patcher);

            return patcher;
        },
    };

    return contextualPatcher;
}
