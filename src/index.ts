import { instead } from "@marshift/strawberry";
import hookDefineProperty from "./utils/objects";
import { internal_getDefiner } from "./metro/internal/modules";
import { initializeMetro } from "./metro/internal";

// This is a blocking function!
async function initialize() {
    try {
        console.log("Initializing Wintry...");
        await initializeMetro();
    } catch (e) {
        if (e instanceof Error) console.error(e.stack);
    }
}

function onceIndexRequired(runFactory: any) {
    const batchedBridge = window.__fbBatchedBridge;

    const callQueue = [] as Array<any[]>;
    const unpatchHook = instead(batchedBridge, "callFunctionReturnFlushedQueue", (args: any, orig: any) => {
        if (args[0] === "AppRegistry" || !batchedBridge.getCallableModule(args[0])) {
            callQueue.push(args);
            return batchedBridge.flushedQueue();
        }

        return orig.apply(batchedBridge, args);
    });

    const startDiscord = async () => {
        await initialize();

        unpatchHook();
        runFactory();

        for (const args of callQueue) {
            if (batchedBridge.getCallableModule(args[0])) {
                batchedBridge.__callFunction(...args);
            }
        }
    };

    startDiscord();
}

const unhook = hookDefineProperty(global, "__d", define => {
    unhook!();
    // @ts-ignore - __d is an internal RN function exposed by Metro
    global.__d = internal_getDefiner(define, onceIndexRequired);
});
