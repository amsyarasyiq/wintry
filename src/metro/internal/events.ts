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

export const metroEvents = new Emitter<MetroEvents>();
export const modulesInitializationEvents = new Emitter<Record<number, []>>();

metroEvents.setMaxListeners(Number.POSITIVE_INFINITY);
