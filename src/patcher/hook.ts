import "no-expose";

// Calls relevant patches and returns the final result
import { patchedFunctions } from "./patcher";

export default (
    patchedFunc: (...args: unknown[]) => unknown,
    origFunc: (...args: unknown[]) => unknown,
    funcArgs: unknown[],
    // The value of `this` to apply
    ctx: any,
    // If true, the function is actually constructor
    isConstruct: boolean,
) => {
    const patch = patchedFunctions.get(patchedFunc);

    if (!patch) {
        return isConstruct ? Reflect.construct(origFunc, funcArgs, ctx) : origFunc.apply(ctx, funcArgs);
    }

    // Before patches
    for (const hook of patch.b.values()) {
        const maybefuncArgs = hook.call(ctx, funcArgs);
        // biome-ignore lint/style/noParameterAssign: We don't want to change too much just for linting
        if (Array.isArray(maybefuncArgs)) funcArgs = maybefuncArgs;
    }

    // Instead patches
    let workingRetVal = [...patch.i.values()].reduce(
        (prev, current) =>
            (...args: unknown[]) =>
                current.call(ctx, args, prev),
        // This calls the original function
        (...args: unknown[]) => (isConstruct ? Reflect.construct(origFunc, args, ctx) : origFunc.apply(ctx, args)),
    )(...funcArgs);

    // After patches
    for (const hook of patch.a.values()) {
        workingRetVal = hook.call(ctx, funcArgs, workingRetVal) ?? workingRetVal;
    }

    // Cleanups (one-times)
    for (const cleanup of patch.c) cleanup();
    patch.c = [];

    return workingRetVal;
};
