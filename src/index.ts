import hookDefineProperty from "./utils/objects";
import { internal_getDefiner } from "./metro/internal/modules";
import { initializeMetro } from "./metro/internal";
import { connectToDebugger, patchLogHook } from "./debug";
import reportErrorOnInitialization from "./error-reporter";
import { trackPerformance } from "./debug/tracer";
import { metroEventEmitter } from "./metro/internal/events";
import { initializePlugins } from "./stores/PluginStore";
import { isSafeModeEnabled } from "./stores/PrefsStore";

export let hasIndexInitialized = false;

// This is a blocking function!
function initialize() {
    try {
        trackPerformance("INITIALIZE");

        console.log("Initializing Wintry...");

        initializeMetro();

        if (!isSafeModeEnabled()) {
            initializePlugins();
        }

        // // Uncomment this to log error boundaries
        // waitFor(byName("ErrorBoundary"), module => {
        //     after(module.prototype, "render", function f(this: any) {
        //         this.state.error && console.log(this.state.error?.stack);
        //     });
        // });

        return () => {
            hasIndexInitialized = true;

            patchLogHook();
            connectToDebugger("ws://localhost:9090");

            metroEventEmitter.emit("metroReady");

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

    const afterInit = initialize();
    runFactory();
    afterInit();

    // const batchedBridge = window.__fbBatchedBridge;

    // // Defer calls from the native side until we're ready
    // const callQueue = [] as Array<any[]>;
    // const unpatchHook = instead(batchedBridge, "callFunctionReturnFlushedQueue", (args: any, orig: any) => {
    //     // We only care about AppRegistry.runApplication calls and modules that are not loaded yet
    //     if (args[0] === "AppRegistry" || !batchedBridge.getCallableModule(args[0])) {
    //         callQueue.push(args);
    //         return batchedBridge.flushedQueue();
    //     }

    //     return orig.apply(batchedBridge, args);
    // });

    // const startDiscord = async () => {
    //     const afterInit = await initialize();

    //     unpatchHook();
    //     runFactory();

    //     for (const args of callQueue) {
    //         if (batchedBridge.getCallableModule(args[0])) {
    //             batchedBridge.__callFunction(...args);
    //         }
    //     }

    //     afterInit();
    // };

    // startDiscord();
}

const unhook = hookDefineProperty(global, "__d", define => {
    unhook!();
    // @ts-ignore - __d is an internal RN function exposed by Metro
    global.__d = internal_getDefiner(define, onceIndexRequired);
    trackPerformance("DEFINE_HOOKED");
});
