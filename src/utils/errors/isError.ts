
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

export function isComponentStack(error: unknown): error is Error & { componentStack: string; } {
    return isError(error) && "componentStack" in error && typeof error.componentStack === "string";
}

export function hasStack(error: unknown): error is Error & { stack: string; } {
    return isError(error) && !!error.stack;
}