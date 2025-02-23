import { definePlugin, meta } from "#plugin-context";
import { Devs } from "@data/constants";
import { lookup } from "@metro";
import { lookupByName, lookupByProps } from "@metro/common/wrappers";
import { SingleMetroModule } from "@metro/module";

import { after } from "@patcher";
import { createContextualPatcher } from "@patcher/contextual";

let socket: WebSocket;

function connectToDebugger(url: string) {
    console.log(`Connecting to debugger at ${url}`);
    if (socket !== undefined && socket.readyState !== WebSocket.CLOSED) socket.close();

    socket = new WebSocket(url);

    socket.addEventListener("message", (message: any) => {
        try {
            // biome-ignore lint/security/noGlobalEval: Not a concern
            eval?.(message.data);
        } catch (e) {
            console.error(e);
        }
    });

    socket.addEventListener("error", (err: any) => {
        console.log(`Debugger error: ${err.message}`);
        // showToast("An error occurred with the debugger connection!", findAssetId("Small"));
    });
}

function patchLogHook() {
    const unpatch = after(globalThis, "nativeLoggingHook", ([message, level]: unknown[]) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ message, level }));
        }
    });

    return () => {
        socket?.close();
        unpatch();
    };
}

const patcher = createContextualPatcher({ pluginId: meta.id });

export default definePlugin({
    name: "DevToolkit",
    description: "A toolkit for developers",
    authors: [Devs.Pylix],
    version: "1.0.0",
    start() {
        Object.defineProperty(SingleMetroModule.prototype, "l", {
            get() {
                return this.asLazy();
            },
        });

        Object.assign(window, {
            lookup,
            lookupByProps,
            lookupByName,
            ...require("../../metro/common/filters"),
            dk: {
                patcher,
                snipe(mod: any, prop: string) {
                    patcher.after(mod, prop, (args, ret) => {
                        console.log(prop, { args, ret });
                        window._ = { args, ret };
                    });
                },
                shotgun(mod: any) {
                    for (const key in mod) {
                        if (typeof mod[key] === "function") {
                            this.snipe(mod, key);
                        }
                    }
                },
                wipe() {
                    patcher.reset();
                },
            },
        });

        patchLogHook();
        connectToDebugger("ws://localhost:9092");
    },
    stop() {},
});
