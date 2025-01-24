import { after } from "../patcher";

let socket: WebSocket;

export function connectToDebugger(url: string) {
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

/**
 * @internal
 */
export function patchLogHook() {
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
