// shelter-mod inspired
import type { FluxDispatcher as FD } from "discord-types/other";

type FluxDispatcherWithInterceptors = FD & {
    _interceptors: FluxIntercept[];
};

const blockedSym = Symbol.for("wintry.flux.blocked");
const modifiedSym = Symbol.for("wintry.flux.modified");

export type FluxEvent = Record<string, any> & { type: string };
export type FluxIntercept = (payload: FluxEvent) => any;
let intercepts: FluxIntercept[] = [];

/**
 * @internal
 * Injects a Flux interceptor into the dispatcher. This will be called in FluxAPI plugin.
 * It returns a function to remove the interceptor.
 */
export function injectFluxInterceptor(FluxDispatcher: FluxDispatcherWithInterceptors) {
    const cb = (payload: any) => {
        let blocked = false;
        let modified = false;

        for (let i = 0, len = intercepts.length; i < len; i++) {
            const res = intercepts[i](payload);

            if (res == null) continue;

            if (!res) {
                blocked = true;
            } else if (typeof res === "object") {
                Object.assign(payload, res);
                modified = true;
            }
        }

        if (blocked) payload[blockedSym] = true;
        if (modified) payload[modifiedSym] = true;

        return blocked;
    };

    (FluxDispatcher._interceptors ??= []).unshift(cb);
    return () => {
        FluxDispatcher._interceptors = FluxDispatcher._interceptors.filter(v => v !== cb);
    };
}

/**
 * Intercept Flux dispatches. Return type affects the end result, where
 * nullish -> nothing, falsy -> block, object -> modify
 */
export function interceptFluxEvent(cb: FluxIntercept) {
    intercepts.push(cb);

    return () => {
        intercepts = intercepts.filter(i => i !== cb);
    };
}
