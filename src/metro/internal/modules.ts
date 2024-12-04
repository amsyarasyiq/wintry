import { Emitter } from "strict-event-emitter";
import type { Metro } from "../types";
import { indexBlacklistFlag } from "./caches";
import { onUntil } from "../../utils/events";

interface ModuleState {
    id: Metro.ModuleID;
    factory: Metro.FactoryFn;
    dependencies: Metro.DependencyMap;
    initialized: boolean;
    module?: any;
}

type MetroEvents = {
    moduleDefined: [ModuleState];
    moduleLoaded: [ModuleState];
};

export const metroEventEmitter = new Emitter<MetroEvents>();
metroEventEmitter.setMaxListeners(Number.POSITIVE_INFINITY);

export const moduleRegistry = new Map<number, ModuleState>();

/** @internal */
export function internal_getDefiner(
    originalDefiner: Metro.DefineFn,
    onceIndexRequired: (runFactory: () => void) => void,
) {
    return (factory: Metro.FactoryFn, id: Metro.ModuleID, dependencies: Metro.DependencyMap) => {
        const wrappedFactory: Metro.FactoryFn = (...args) => {
            if (id === 0) {
                onceIndexRequired(() => factory(...args));
            } else {
                const { 1: metroRequire } = args;

                // Avoid catching default or named exports
                args[2 /* metroImportDefault */] = id => {
                    const exps = metroRequire(id);
                    return exps?.__esModule ? exps.default : exps;
                };

                args[3 /* metroImportAll */] = id => {
                    const exps = metroRequire(id);
                    if (exps?.__esModule) return exps;

                    const importAll: Record<string, any> = {};
                    if (exps) Object.assign(importAll, exps);
                    importAll.default = exps;
                    return importAll;
                };
            }

            factory(...args);

            const state = moduleRegistry.get(id)!;
            state.module = args[4];
            state.initialized = true;

            if (isModuleExportsBad(args[4])) {
                indexBlacklistFlag(id);
            } else {
                metroEventEmitter.emit("moduleLoaded", state);
            }
        };

        const state: ModuleState = { id, factory, dependencies, initialized: false };
        moduleRegistry.set(id, state);
        metroEventEmitter.emit("moduleDefined", state);

        originalDefiner(wrappedFactory, id, dependencies);
    };
}

export function isModuleExportsBad(exports: any) {
    return (
        exports == null ||
        exports === globalThis ||
        exports["<insert the funny here>"] === null || // A proxy which always returns null
        (exports.__proto__ === Object.prototype && Reflect.ownKeys(exports).length === 0)
    );
}

export function patchModule(
    predicate: (module: ModuleState) => boolean,
    patch: (module: ModuleState) => void,
    { max = 1 } = {},
) {
    let count = 0;

    onUntil(metroEventEmitter, "moduleDefined", module => {
        if (predicate(module)) {
            patch(module);
            count++;

            if (count === max) return true;
        }

        return false;
    });
}

// metroEventEmitter.on("moduleLoaded", module => {
//     if (module.publicModule?.exports?.registerAsset) {
//         const assetRegistryModuleId = module.id;

//         moduleRegistry.forEach((module, id) => {
//             if (Number(module.dependencies) === assetRegistryModuleId) {
//                 console.log(`${id} is an asset module`);
//             }
//         });
//     }
// });
