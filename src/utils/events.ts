import type { Emitter } from "strict-event-emitter";

type EventMap = {
    [eventName: string]: Array<unknown>;
};

/**
 * Registers an event listener on the specified emitter that will be automatically removed
 * after the listener returns `true` for the first time.
 *
 * @param {Emitter<Events>} emitter - The event emitter to register the listener on.
 * @param {EventName} eventName - The name of the event to listen for.
 * @param {(...data: Events[EventName]) => boolean} listener - The listener function that will be called
 * with the event data. If this function returns `true`, the listener will be removed.
 */
export function onUntil<Events extends EventMap, EventName extends keyof Events>(
    emitter: Emitter<Events>,
    eventName: EventName,
    listener: (...data: Events[EventName]) => boolean,
) {
    const callback = (...args: Events[EventName]) => {
        const shouldOff = listener(...args);
        if (shouldOff) emitter.off(eventName, callback);
    };

    emitter.on(eventName, callback);
}
