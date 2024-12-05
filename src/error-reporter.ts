// This function is called when an error occurs in the initialization process.
// Most globals are not available at this point, so make sure the function is self-contained and error-proof as much as possible.
// Avoid importing any modules, with exception to modules that are guaranteed to be available and rarely change.

import hookDefineProperty from "./utils/objects";

function getStackTrace(error: unknown) {
    if (error instanceof Error) {
        return error.stack;
    }

    return String(error) || "<unknown error>";
}

function maybeLogError(error: unknown) {
    const stackTrace = getStackTrace(error);

    hookDefineProperty(window, "console", (console: Console) => {
        console.error(`An error occurred during initialization: ${stackTrace}`);
    });
}

function maybeAlertError(error: unknown) {
    const stackTrace = getStackTrace(error);

    hookDefineProperty(window, "alert", (alert: typeof window.alert) => {
        alert(`Bunny crashed due to an error: ${stackTrace}`);
    });

    // TODO: If alert is not available, try calling the native alert directly
}

export default function reportErrorOnInitialization(error: unknown) {
    maybeLogError(error);
    maybeAlertError(error);
}
