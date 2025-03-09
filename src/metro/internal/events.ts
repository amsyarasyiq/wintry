// This folder is required during preinitialization. Imports are very sensitive.
import { Emitter } from "strict-event-emitter";
import type { ModuleState } from "../types";

type MetroEvents = {
    moduleLoaded: [ModuleState];
    lookupFound: [string, ModuleState];
};

export const metroEvents = new Emitter<MetroEvents>();
export const modulesInitializationEvents = new Emitter<Record<number, []>>();

metroEvents.setMaxListeners(Number.POSITIVE_INFINITY);
