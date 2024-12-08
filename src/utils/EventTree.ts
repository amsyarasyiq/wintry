type Listener<T> = (data: T) => void;

export default class EventTree<T> {
    private listeners: Map<string, Listener<T>[]>;

    constructor() {
        this.listeners = new Map();
    }

    // Add an event listener
    on(event: string, listener: Listener<T>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event)!.push(listener);
    }

    // Emit an event and trigger listeners
    emit(event: string, data: T): void {
        const segments = event.split(".");
        const emitListeners = (key: string) => {
            if (this.listeners.has(key)) {
                for (const listener of this.listeners.get(key)!) {
                    listener(data);
                }
            }
        };

        // Collect matching listeners for specific and wildcard events
        this.listeners.forEach((_, key) => {
            const keySegments = key.split(".");

            // Match specific events
            if (key === event) {
                emitListeners(key);
                return;
            }

            // Match wildcard events
            for (let i = 0; i < segments.length; i++) {
                if (keySegments[i] === "*" && keySegments.slice(0, i).join(".") === segments.slice(0, i).join(".")) {
                    emitListeners(key);
                }
            }
        });
    }
}
