import { wtlogger } from "@api/logger";
import { delay } from "es-toolkit";
import { inspect } from "node-inspect-extracted";

// WebSocket configuration, hardcoded for now
const WS_HOST = "localhost";
const WS_PORT = 9090;

// WebSocket connection manager
const setupWebsocketConnection = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`ws://${WS_HOST}:${WS_PORT}`);

        const handleOpen = () => {
            socket.send(
                JSON.stringify({
                    type: "handshake",
                    client: "Wintry",
                    logBuffer: wtlogger.logs,
                }),
            );

            // Setup log forwarding and cleanup
            const removeLogPipe = setupLogForwarding(socket);
            socket.addEventListener("close", removeLogPipe);

            // Resolve the promise with the socket
            resolve(socket);
        };

        // Handle connection errors
        socket.addEventListener("error", error => {
            reject(new Error(`Failed to connect to WebSocket server: ${error}`));
        });

        socket.addEventListener("open", handleOpen);
        socket.addEventListener("message", ({ data }) => handleIncomingMessage(socket, data));
    });
};

// Log forwarding setup
const setupLogForwarding = (socket: WebSocket) => {
    return wtlogger.pipe(args => {
        socket.send(
            JSON.stringify({
                type: "log",
                details: args,
            }),
        );
    });
};

// Message handlers
const messageHandlers = {
    handshake: () => {
        // Handshake completed
    },

    eval: async (socket: WebSocket, message: any) => {
        let result: any;
        let error: any;

        try {
            result = await globalEvalWithSourceUrl(message.code, `repl-${message.nonce}`);
            if (result?.await) {
                result.return = await result.return;
            }
            result = result?.return;
        } catch (err) {
            error = err;
        }

        if (result) {
            storeResultInWindowContext(result, message.nonce);
        }

        sendEvalResult(socket, message.nonce, result, error, message.color);
    },

    "get-global-hints": (socket: WebSocket) => {
        const hints = ["wintry", "lookup", "lookupByProps", "lookupByName", "dk"];
        socket.send(
            JSON.stringify({
                type: "global-hints",
                hints,
            }),
        );
    },
};

// Handle incoming WebSocket messages
const handleIncomingMessage = async (socket: WebSocket, data: any) => {
    const message = JSON.parse(data.toString());
    if (!message.type || !(message.type in messageHandlers)) return;

    const handler = messageHandlers[message.type as keyof typeof messageHandlers];

    if (handler) {
        await handler(socket, message);
    } else {
        // biome-ignore lint/suspicious/noConsole: We don't want to log here
        console.error("Unknown message type", message);

        // Maybe let the client know that the message type is unknown?
    }
};

// Store evaluation results in window context
const storeResultInWindowContext = (result: any, nonce: string) => {
    Object.defineProperty(window, "___", { value: window.__, configurable: true });
    Object.defineProperty(window, "__", { value: window._, configurable: true });
    Object.defineProperty(window, "_", { value: result, configurable: true });
    Object.defineProperty(window, `_${nonce}`, {
        value: result,
        configurable: true,
    });
};

// Send evaluation result back to client
const sendEvalResult = (socket: WebSocket, nonce: string, result: any, error: any, colorize: boolean) => {
    socket.send(
        JSON.stringify({
            type: "eval-result",
            nonce: nonce,
            error: error ? inspect(error) : null,
            result: inspect(result, {
                customInspect: true,
                colors: colorize,
            }),
        }),
    );
};

export async function establishWebSocketConnection() {
    let stop = false;
    let socket: WebSocket | null = null;

    while (!stop) {
        try {
            if (socket && socket.readyState === WebSocket.OPEN) {
                await delay(5000);
                continue;
            }

            socket = await setupWebsocketConnection();
        } catch (error) {
            await delay(2000);
        }
    }

    return () => (stop = true);
}
