import { Emitter } from "strict-event-emitter";
import type { ModuleState } from "../types";
import type { MetroCache } from "./caches";

type MetroEvents = {
    metroReady: [];
    moduleDefined: [ModuleState];
    moduleLoaded: [ModuleState];
    lookupFound: [string, ModuleState];
    cacheLoaded: [MetroCache];
};

export const metroEventEmitter = new Emitter<MetroEvents>();
metroEventEmitter.setMaxListeners(Number.POSITIVE_INFINITY);
