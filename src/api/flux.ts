import type { FluxDispatcher as FD } from "discord-types/other";

type FluxDispatcherWithInterceptors = FD & {
    _interceptors: FluxIntercept[];
};

const blockedSym = Symbol.for("wintry.flux.blocked");
const modifiedSym = Symbol.for("wintry.flux.modified");

let intercepts: FluxIntercept[] = [];
const typeSpecificIntercepts: Map<string, FluxIntercept[]> = new Map();

export type FluxEvent = Record<string, any> & { type: string, [blockedSym]?: boolean, [modifiedSym]?: boolean };

/**
 * Function type for intercepting Flux events.
 * Return value determines behavior: null/undefined = pass through, false = block, object = modify.
 */
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
 * Intercept ALL Flux events globally. Use `interceptFluxEventType()` for better performance
 * when targeting specific event types.
 * 
 * @param cb - Interceptor function. Return values:
 *   - `null`/`undefined`: Pass through unchanged
 *   - `false` or falsy: Block the event  
 *   - Object: Modify by merging with original payload
 * @returns Cleanup function to remove the interceptor
 * 
 * @example
 * ```ts
 * // Global event logger
 * const cleanup = interceptFluxEvent((payload) => {
 *     console.log(`Event: ${payload.type}`, payload);
 *     return null; // Don't modify
 * });
 * 
 * // Block all message events
 * const blockMessages = interceptFluxEvent((payload) => {
 *     return payload.type.startsWith("MESSAGE_") ? false : null;
 * });
 * 
 * // Clean up
 * cleanup();
 * blockMessages();
 * ```
 */
export function interceptFluxEvent(cb: FluxIntercept) {
    intercepts.push(cb);

    return () => {
        intercepts = intercepts.filter(i => i !== cb);
    };
}

/**
 * Intercept Flux events for a specific event type.
 * 
 * @param eventType - Event type to intercept (e.g., "MESSAGE_CREATE", "TYPING_START")
 * @param cb - Interceptor function. Return values:
 *   - `null`/`undefined`: Pass through unchanged
 *   - `false` or falsy: Block the event
 *   - Object: Modify by merging with original payload
 * @returns Cleanup function to remove the interceptor
 * 
 * @example
 * ```ts
 * // Block messages with bad words
 * const censor = interceptFluxEventType("MESSAGE_CREATE", (payload) => {
 *     if (payload.content?.includes("badword")) {
 *         return false; // Block completely
 *     }
 *     return null;
 * });
 * 
 * // Replace words in messages
 * const replace = interceptFluxEventType("MESSAGE_CREATE", (payload) => {
 *     if (payload.content?.includes("old")) {
 *         return { content: payload.content.replace("old", "new") };
 *     }
 *     return null;
 * });
 * 
 * // Log typing events
 * const logTyping = interceptFluxEventType("TYPING_START", (payload) => {
 *     console.log(`${payload.userId} typing in ${payload.channelId}`);
 *     return null;
 * });
 * 
 * // Cleanup
 * censor();
 * replace();
 * logTyping();
 * ```
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
