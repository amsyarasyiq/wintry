import { lazyValue } from "@utils/lazy";
import type { Metro } from "./types";

export * from "./filters";
export * from "./assets";

export const requireModule = lazyValue(() => window.__r) as Metro.RequireFn;
