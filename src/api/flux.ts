import type { FluxDispatcher as FD } from "discord-types/other";

type FluxDispatcherWithInterceptors = FD & {
    _interceptors: FluxIntercept[];
};

const blockedSym = Symbol.for("wintry.flux.blocked");
const modifiedSym = Symbol.for("wintry.flux.modified");

let intercepts: FluxIntercept[] = [];
const typeSpecificIntercepts: Map<string, FluxIntercept[]> = new Map();

export type FluxEvent = Record<string, any> & { type: string, [blockedSym]?: boolean, [modifiedSym]?: boolean };
export type FluxIntercept = (payload: FluxEvent) => any;

/**
 * @internal
 * Injects a Flux interceptor into the dispatcher. This will be called in FluxAPI plugin.
 * It returns a function to remove the interceptor.
 */
export function injectFluxInterceptor(FluxDispatcher: FluxDispatcherWithInterceptors) {
    const cb = (payload: FluxEvent) => {
        let blocked = false;
        let modified = false;

        // Process general interceptors
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

        // Process type-specific interceptors
        const typeSpecific = typeSpecificIntercepts.get(payload.type);
        if (typeSpecific) {
            for (let i = 0, len = typeSpecific.length; i < len; i++) {
                const res = typeSpecific[i](payload);

                if (res == null) continue;

                if (!res) {
                    blocked = true;
                } else if (typeof res === "object") {
                    Object.assign(payload, res);
                    modified = true;
                }
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

/**
 * Intercept Flux dispatches for a specific event type. This is more performant
 * than the general interceptor when you only need to listen to specific events.
 * Return type affects the end result, where nullish -> nothing, falsy -> block, object -> modify
 */
export function interceptFluxEventType(eventType: string, cb: FluxIntercept) {
    const existing = typeSpecificIntercepts.get(eventType);
    if (existing) {
        existing.push(cb);
    } else {
        typeSpecificIntercepts.set(eventType, [cb]);
    }

    return () => {
        const callbacks = typeSpecificIntercepts.get(eventType);
        if (callbacks) {
            const filtered = callbacks.filter(i => i !== cb);
            if (filtered.length === 0) {
                typeSpecificIntercepts.delete(eventType);
            } else {
                typeSpecificIntercepts.set(eventType, filtered);
            }
        }
    };
}
