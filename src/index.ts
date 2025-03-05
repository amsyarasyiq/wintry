import { wtlogger } from "@api/logger";
import reportErrorOnInitialization from "./error-reporter";
import { wintryGlobalObject } from "./globals";
import { initializeMetro } from "./metro/internal";
import { metroEvents } from "./metro/internal/events";
import { internal_getDefiner } from "./metro/internal/modules";
import { initializePlugins } from "./stores/usePluginStore";
import { isSafeModeEnabled } from "./stores/usePrefsStore";
import hookDefineProperty from "./utils/objects";

export let hasIndexInitialized = false;

Object.freeze = Object.seal = Object;

// This is a blocking function!
function initialize() {
    try {
        wtlogger.info("Initializing Wintry...");

        initializeMetro();

        // TODO: Required plugins should run anyways, so move this safe mode check to a better place
        if (!isSafeModeEnabled()) {
            initializePlugins();
        }

        return () => {
            hasIndexInitialized = true;

            // __reactDevTools!.exports.connectToDevTools({
            //     host: "localhost",
            //     resolveRNStyle: require("react-native").flatten,
            // })

            metroEvents.emit("metroReady");

            window.wintry = wintryGlobalObject();

            wtlogger.info(`Fully initialized Wintry in ${nativePerformanceNow() - WINTRY_START_TIME}ms!`);
        };
    } catch (e) {
        return () => {
            reportErrorOnInitialization(e);
        };
    }
}

function onceIndexRequired(runFactory: any) {
    if (hasIndexInitialized) return;

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
});
