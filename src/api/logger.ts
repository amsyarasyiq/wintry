import { inspect } from "node-inspect-extracted";

type LogFn = (message: string, level: string) => void;

type Message = string | TemplateStringsArray;
export type BasicLogger = Omit<Logger, "pipe" | "unpipe" | "unpipeAll">;

class Logger {
    name: string;
    breadcrumbs: string[] = [];
    parent: Logger | null = null;

    logs: Parameters<LogFn>[] = [];
    private logHandlers: Set<LogFn> = new Set();

    constructor(name: string) {
        this.name = name;

        if (this.breadcrumbs.length === 0) {
            this.breadcrumbs.push(name);
        }
    }

    executeOnSelfAndAncestors(fn: (logger: Logger) => void): void {
        fn(this);

        let parent = this.parent;
        while (parent) {
            fn(parent);
            parent = parent.parent;
        }
    }

    createChild(name: string): BasicLogger {
        const logger = new Logger(name);

        logger.parent = this;
        logger.breadcrumbs = [...this.breadcrumbs, name];

        return logger;
    }

    private log(level: string, message: Message, ...substitutions: any[]): void {
        if (typeof message === "object") {
            // biome-ignore lint/style/noParameterAssign:
            message = String.raw(message, ...substitutions);
        }

        this.executeOnSelfAndAncestors(logger => {
            if (logger.logHandlers.size > 0) {
                for (const handler of logger.logHandlers) {
                    handler(message, level);
                }
            }

            logger.logs.push([message, level]);
        });
    }

    info(message: string): void;
    info(template: TemplateStringsArray, ...substitutions: any[]): void;
    info(message: Message, ...substitutions: any[]): void {
        this.log("info", message, ...substitutions);
    }

    warn(message: string): void;
    warn(template: TemplateStringsArray, ...substitutions: any[]): void;
    warn(message: Message, ...substitutions: any[]): void {
        this.log("warn", message, ...substitutions);
    }

    error(message: string): void;
    error(template: TemplateStringsArray, ...substitutions: any[]): void;
    error(message: Message, ...substitutions: any[]): void {
        substitutions.forEach((a, i) => {
            if (a instanceof Error) {
                substitutions[i] = a.stack;
            }
        });
        this.log("error", message, ...substitutions);
    }

    inspect(...data: any[]): void {
        let inspected = "";

        if (data.length === 1) {
            inspected = inspect(data[0]);
        } else {
            inspected = inspect(data);
        }

        this.log("info", inspected);
    }

    pipe(logHandler: LogFn): () => void {
        this.executeOnSelfAndAncestors(logger => {
            logger.logHandlers.add(logHandler);
        });
        return () => this.unpipe(logHandler);
    }

    unpipe(logHandler: LogFn): void {
        this.executeOnSelfAndAncestors(logger => {
            logger.logHandlers.delete(logHandler);
        });
    }

    unpipeAll(): void {
        this.executeOnSelfAndAncestors(logger => {
            if (logger === this) return;

            for (const handler of this.logHandlers) {
                if (logger.logHandlers.has(handler)) {
                    logger.logHandlers.delete(handler);
                }
            }
        });

        this.logHandlers.clear();
    }
}

export const wtlogger = new Logger("Wintry");
