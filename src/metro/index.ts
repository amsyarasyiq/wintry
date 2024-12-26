import { lazyValue } from "../utils/lazy";
import type { Metro } from "./types";

export * from "./api";
export * from "./factories";
export * from "./assets";

export * as common from "./common";
export * as filters from "./filters";

export const requireModule = lazyValue(() => window.__r) as Metro.RequireFn;
