// This folder is required during preinitialization. Imports are very sensitive.
import type { Metro, ModuleState } from "../types";
import { metroEvents, modulesInitializationEvents } from "./events";

export const moduleRegistry = new Map<number, ModuleState>();
export const initializedModuleRegistry = new Set<ModuleState>();

// This has higher priority than the one in metroEvents
export const internal_onModuleLoaded = new Set<(state: ModuleState) => void>();

export let _importingModuleId = -1;

/** @internal */
export function internal_getDefiner(
    originalDefiner: Metro.DefineFn,
    onceIndexRequired: (runFactory: () => void) => void,
) {
    return (factory: Metro.FactoryFn, id: Metro.ModuleID, dependencies: Metro.DependencyMap) => {
        const wrappedFactory = wrapModuleFactory(id, onceIndexRequired, factory);

        const state: ModuleState = { id, dependencies, initialized: false, meta: {} };
        moduleRegistry.set(id, state);

        originalDefiner(wrappedFactory, id, dependencies);
    };
}

function wrapModuleFactory(
    id: number,
    onceIndexRequired: (runFactory: () => void) => void,
    factory: Metro.FactoryFn,
): Metro.FactoryFn {
    return (a0, a1, a2, a3, a4, a5, a6) => {
        const state = moduleRegistry.get(id)!;

        if (id === 0) {
            onceIndexRequired(() => factory(a0, a1, a2, a3, a4, a5, a6));
            state.initialized = true;

            return;
        }

        const originalImportingModuleId = _importingModuleId;
        _importingModuleId = id;

        try {
            factory(a0, a1, a2, a3, a4, a5, a6); // Factory does not return anything
        } catch (e) {
            state.error = e;
        } finally {
            _importingModuleId = originalImportingModuleId;

            state.module = a4;
            state.initialized = true;

            initializedModuleRegistry.add(state);
            for (const handler of internal_onModuleLoaded) handler(state);

            metroEvents.emit("moduleLoaded", state);
            modulesInitializationEvents.emit(id);
        }
    };
}
