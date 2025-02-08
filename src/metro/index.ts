import { lazyValue } from "@utils/lazy";
import type { Metro } from "./types";

export * from "./legacy_api";
export * from "./factories";
export * from "./assets";

export const requireModule = lazyValue(() => window.__r) as Metro.RequireFn;
