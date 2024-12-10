import { lazyValue } from "../utils/lazy";
import type { Metro } from "./types";

export const requireModule = lazyValue(() => window.__r) as Metro.RequireFn;
