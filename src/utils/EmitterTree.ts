import { Emitter } from "strict-event-emitter";

type EventMap = {
    [eventName: string]: Array<unknown>;
};

export default class EventTree<Events extends EventMap> extends Emitter<Events> {
    emit<EventName extends keyof Events>(eventName: EventName, ...data: Events[EventName]): boolean {
        if (typeof eventName !== "string") return super.emit(eventName, ...data);

        const eventNames = this.eventNames() as Array<keyof Events>;

        const segments = eventName.split(".");
        const emitListeners = (key: keyof Events) => {
            super.emit(key, ...data);
        };

        for (const key of eventNames) {
            if (typeof key !== "string") continue;

            if (key === eventName) {
                emitListeners(key);
                continue;
            }

            const keySegments = key.split(".");

            // Match wildcard events
            for (let i = 0; i < segments.length; i++) {
                if (keySegments[i] === "*" && keySegments.slice(0, i).join(".") === segments.slice(0, i).join(".")) {
                    emitListeners(key);
                }
            }
        }

        return false;
    }
}
