import { proxyLazy } from "../utils/lazy";
import type { Metro } from "./types";

export const requireModule = proxyLazy(() => window.__r) as Metro.RequireFn;
