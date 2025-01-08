import type { LiteralUnion } from "type-fest";
import hook from "./hook";

type PatchType = "b" | "i" | "a";

interface Patch {
    // Before hooks
    b: Map<symbol, (...args: unknown[]) => unknown>;
    // Instead hooks
    i: Map<symbol, (...args: unknown[]) => unknown>;
    // After hooks
    a: Map<symbol, (...args: unknown[]) => unknown>;
    // Cleanups
    c: Array<(...args: unknown[]) => unknown>;
}

// These might be a bit strict, but the user can cast if needed
interface CallbackTypes<F extends (...args: any[]) => any> {
    b: (args: Parameters<F>) => Parameters<F> | void | undefined;
    i: (args: Parameters<F>, origFunc: NonNullable<F>) => ReturnType<F>;
    a: (args: Parameters<F>, ret: ReturnType<F>) => ReturnType<F> | void | undefined;
}

type DelayCallback = (callback: (target: any) => void) => unknown;

/** @internal */
export const _patcherDelaySymbol = Symbol.for("wintry.patcher.delaysymbol");

export function getPatchFunc<T extends PatchType>(patchType: T) {
    const patch = <
        P extends Record<PropertyKey, any> = Record<any, any>,
        N extends LiteralUnion<keyof P, string> = LiteralUnion<keyof P, string>,
    >(
        funcParent: P,
        funcName: N,
        callback: CallbackTypes<P[N]>[T],
        oneTime = false,
    ) => {
        const origFunc = funcParent[funcName];

        if (typeof origFunc !== "function") {
            throw new Error(`${String(funcName)} is not a function in ${funcParent.constructor.name}`);
        }

        let funcPatch = patchedFunctions.get(origFunc);

        if (!funcPatch) {
            funcPatch = {
                b: new Map(),
                i: new Map(),
                a: new Map(),
                c: [],
            };

            const replaceProxy = new Proxy(origFunc, {
                apply: (_, ctx, args) => runHook(ctx, args, false),
                construct: (_, args) => runHook(origFunc, args, true),

                get: (target, prop, receiver) =>
                    prop === "toString" ? origFunc.toString.bind(origFunc) : Reflect.get(target, prop, receiver),
            });

            const runHook: any = (ctx: unknown, args: unknown[], construct: boolean) =>
                hook(replaceProxy, origFunc, args, ctx, construct);

            patchedFunctions.set(replaceProxy, funcPatch);

            if (
                !Reflect.defineProperty(funcParent, funcName, {
                    value: replaceProxy,
                    configurable: true,
                    writable: true,
                })
            ) {
                funcParent[funcName] = replaceProxy;
            }
        }

        const hookId = Symbol();

        const patchedFunc = funcParent[funcName];
        const unpatchThisPatch = () => unpatch(patchedFunc, hookId, patchType);

        if (oneTime) funcPatch.c.push(unpatchThisPatch);
        funcPatch[patchType].set(hookId, callback as (...args: unknown[]) => unknown);

        return unpatchThisPatch;
    };

    const patchWithDelay = <
        P extends Record<PropertyKey, any> = Record<any, any>,
        N extends LiteralUnion<keyof P, string> = LiteralUnion<keyof P, string>,
    >(
        funcParent: P,
        funcName: N,
        callback: CallbackTypes<P[N]>[T],
        oneTime = false,
    ) => {
        if (_patcherDelaySymbol in funcParent) {
            const delayCallback: DelayCallback = funcParent[_patcherDelaySymbol];

            let cancel = false;
            let unpatch = () => (cancel = true);

            delayCallback(target => {
                if (cancel) return;
                unpatch = patch(target, funcName, callback, oneTime);
            });

            return () => unpatch();
        }

        return patch(funcParent, funcName, callback, oneTime);
    };

    const patchAsync = <
        P extends Record<PropertyKey, any> = Record<any, any>,
        N extends LiteralUnion<keyof P, string> = LiteralUnion<keyof P, string>,
    >(
        promiseOfParent: Promise<P>,
        funcName: N,
        callback: CallbackTypes<P[N]>[T],
        oneTime = false,
    ) => {
        if (!promiseOfParent || !("then" in promiseOfParent)) throw new Error("target is not a then-able object");

        let cancel = false;
        let unpatch = () => (cancel = true);

        promiseOfParent.then(target => {
            if (cancel) return;
            unpatch = patch(target, funcName, callback, oneTime);
            return target;
        });

        return () => unpatch();
    };

    return Object.assign(patchWithDelay, {
        pure: patch,
        async: patchAsync,
    });
}

export function unpatch(patchedFunction: (...args: unknown[]) => unknown, hookId: symbol, type: PatchType) {
    const patch = patchedFunctions.get(patchedFunction);
    if (!patch || !patch[type].delete(hookId)) return false;

    return true;
}

export const patchedFunctions = new WeakMap<(...args: unknown[]) => unknown, Patch>();
