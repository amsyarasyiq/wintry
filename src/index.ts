import hookDefineProperty from "./utils/objects";
import { internal_getDefiner } from "./metro/internal/modules";
import { initializeMetro } from "./metro/internal";
import { connectToDebugger, patchLogHook } from "./debug";
import reportErrorOnInitialization from "./error-reporter";
import { instead } from "./patcher";
import { startAllPlugins } from "./plugins";
import { StartAt } from "./plugins/types";
import { trackPerformance } from "./debug/tracer";
import { setupMmkv } from "./api/kvStorage";

export let hasIndexInitialized = false;

// This is a blocking function!
async function initialize() {
    try {
        trackPerformance("INITIALIZE");

        console.log("Initializing Wintry...");

        await setupMmkv();
        await initializeMetro();

        startAllPlugins(StartAt.Init);

        return () => {
            hasIndexInitialized = true;

            patchLogHook();
            connectToDebugger("ws://localhost:9090");

            startAllPlugins(StartAt.MetroReady);

            trackPerformance("FINISH_INITIALIZED");
        };
    } catch (e) {
        return () => {
            reportErrorOnInitialization(e);
        };
    }
}

function onceIndexRequired(runFactory: any) {
    trackPerformance("INDEX_REQUIRED");
    const batchedBridge = window.__fbBatchedBridge;

    // Defer calls from the native side until we're ready
    const callQueue = [] as Array<any[]>;
    const unpatchHook = instead(batchedBridge, "callFunctionReturnFlushedQueue", (args: any, orig: any) => {
        // We only care about AppRegistry.runApplication calls and modules that are not loaded yet
        if (args[0] === "AppRegistry" || !batchedBridge.getCallableModule(args[0])) {
            callQueue.push(args);
            return batchedBridge.flushedQueue();
        }

        return orig.apply(batchedBridge, args);
    });

    const startDiscord = async () => {
        const afterInit = await initialize();

        unpatchHook();
        runFactory();

        for (const args of callQueue) {
            if (batchedBridge.getCallableModule(args[0])) {
                batchedBridge.__callFunction(...args);
            }
        }

        afterInit();
    };

    startDiscord();
}

const unhook = hookDefineProperty(global, "__d", define => {
    unhook!();
    // @ts-ignore - __d is an internal RN function exposed by Metro
    global.__d = internal_getDefiner(define, onceIndexRequired);
    trackPerformance("DEFINE_HOOKED");
});
