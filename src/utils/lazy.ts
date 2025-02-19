import { isPrimitive } from "es-toolkit";

type ExemptedEntries = Record<symbol | string, unknown>;

interface LazyOptions<E extends ExemptedEntries> {
    /**
     * Type of the 'dummy' object for the proxy. Defaults to "function" since it's less restrictive than "object" (can call functions).
     * */
    hint?: "function" | "object";
    /**
     * Entries that are internally used to access a property without invoking the factory function.
     */
    exemptedEntries?: E;
    /**
     * If set to false, function properties returned will NOT be bound to the resolved object.\
     * You can set this to false if you want to retain the original reference to the function property.\
     * Alternatively, you can access the original function by using the hidden property `Symbol.for("wintry.lazy.originalFn")` on the bound function.
     */
    retainContext?: boolean;
}

interface ContextHolder {
    options: LazyOptions<any>;
    factory: (...args: any[]) => any;
}

const originalFnSym = Symbol.for("wintry.lazy.originalFn");
const unconfigurable = new Set(["arguments", "caller", "prototype"]);
const isUnconfigurable = (key: PropertyKey) => typeof key === "string" && unconfigurable.has(key);

const factories = new WeakMap<any, () => any>();
const proxyContextHolder = new WeakMap<any, ContextHolder>();

const lazyHandler: ProxyHandler<any> = {
    ...Object.fromEntries(
        Object.getOwnPropertyNames(Reflect).map(fnName => {
            return [
                fnName,
                (target: any, ...args: any[]) => {
                    const contextHolder = proxyContextHolder.get(target);
                    const resolved = contextHolder?.factory();
                    if (!resolved) throw new Error(`Trying to Reflect.${fnName} of ${typeof resolved}`);
                    // @ts-expect-error
                    return Reflect[fnName](resolved, ...args);
                },
            ];
        }),
    ),
    has(target, p) {
        const contextHolder = proxyContextHolder.get(target);

        if (contextHolder?.options) {
            const { exemptedEntries: isolatedEntries } = contextHolder.options;
            if (isolatedEntries && p in isolatedEntries) return true;
        }

        const resolved = contextHolder?.factory();
        if (!resolved) throw new Error(`Trying to Reflect.has of ${typeof resolved}`);
        return Reflect.has(resolved, p);
    },
    get(target, p, receiver) {
        const contextHolder = proxyContextHolder.get(target);

        if (contextHolder?.options) {
            const { exemptedEntries } = contextHolder.options;
            if (exemptedEntries?.[p]) return exemptedEntries[p];
        }

        const resolved = contextHolder?.factory();

        try {
            const ret = Reflect.get(resolved, p, receiver);
            if (typeof ret === "function" && contextHolder?.options?.retainContext !== false) {
                return new Proxy(ret, {
                    get(target, prop, receiver) {
                        if (prop === originalFnSym) return target;
                        return Reflect.get(target, prop, receiver);
                    },
                    apply(target, thisArg, args) {
                        return Reflect.apply(target, thisArg === receiver ? resolved : thisArg, args);
                    },
                });
            }

            return ret;
        } catch (e) {
            throw new Error(`Reflect.get called on ${typeof resolved}`);
        }
    },
    ownKeys: target => {
        const contextHolder = proxyContextHolder.get(target);
        const resolved = contextHolder?.factory();
        if (!resolved) throw new Error(`Reflect.ownKeys of ${typeof resolved}`);

        const cacheKeys = Reflect.ownKeys(resolved);
        for (const key of unconfigurable) {
            if (!cacheKeys.includes(key)) {
                cacheKeys.push(key);
            }
        }
        return cacheKeys;
    },
    getOwnPropertyDescriptor: (target, p) => {
        const contextHolder = proxyContextHolder.get(target);
        const resolved = contextHolder?.factory();
        if (!resolved) throw new Error(`Reflect.getOwnPropertyDescriptor of ${typeof resolved}`);

        if (isUnconfigurable(p)) return Reflect.getOwnPropertyDescriptor(target, p);

        const descriptor = Reflect.getOwnPropertyDescriptor(resolved, p);
        if (descriptor) Object.defineProperty(target, p, descriptor);
        return descriptor;
    },
};

/**
 * Lazy proxy that will only call the factory function when needed (when a property is accessed).
 *
 * For primitive values (strings, numbers, booleans), the lazy value will be converted to an object, since proxies can't be primitive
 * @param factory Factory function to create the object
 * @param opts Options for the lazy proxy
 * @returns A proxy that will call the factory function only when needed
 * @example const ChannelStore = lazyValue(() => findByProps("getChannelId"));
 */
export function lazyValue<T, I extends ExemptedEntries>(factory: () => T, opts: LazyOptions<I> = {}): T {
    let cache: T;

    const dummy = opts.hint !== "object" ? () => {} : {};
    const proxyFactory = () => {
        if (!cache) {
            cache = factory();

            if (cache != null) {
                factories.set(cache, proxyFactory);
                // @ts-expect-error - TypeScript doesn't know this is a constructor
                if (isPrimitive(cache)) cache = new cache!.constructor(cache);
            }
        }

        return cache;
    };

    const proxy = new Proxy(dummy, lazyHandler) as T & I;
    factories.set(proxy, proxyFactory);
    proxyContextHolder.set(dummy, {
        factory: proxyFactory,
        options: opts,
    });

    return proxy;
}

/**
 * Lazily destructure an object with all the properties being lazified. This assumes all the properties are either an object or a function
 * @param factory Factory function which resolves to the object (and caches it)
 * @param asFunction Mock the proxy as a function
 * @example
 *
 * // Using immediate here to get the object immediately
 * const { uuid4 } = lazyDestructure(() => findByPropsImmediate("uuid4"));
 * uuid4; // <- is a lazy proxy!
 *
 * // You can also retain the original object and access it lazily
 * const [ThemeStore, {theme}] = lazyDestructure(() => findByStoreNameImmediate("ThemeStore"));
 * ThemeStore; // <- is a lazy proxy!
 * theme.valueOf(); // <- is a lazy proxy! valueOf is needed to access it since it's a primitive
 */
export function lazyDestructure<T extends Record<PropertyKey, unknown>, I extends ExemptedEntries>(
    factory: () => T,
    opts: LazyOptions<I> = {},
): T {
    const proxiedObject = lazyValue(factory);

    return new Proxy(
        {},
        {
            get(_, property) {
                if (property === Symbol.iterator) {
                    return function* () {
                        yield proxiedObject;
                        yield new Proxy(
                            {},
                            {
                                get: (_, p) => lazyValue(() => proxiedObject[p], opts),
                            },
                        );
                        throw new Error("This is not a real iterator, this is likely used incorrectly");
                    };
                }
                return lazyValue(() => proxiedObject[property], opts);
            },
        },
    ) as T;
}

export function getProxyFactory<T>(obj: T): (() => T) | undefined {
    return factories.get(obj) as (() => T) | undefined;
}

/**
 * @internal
 * For internal use only. This is used for { lazy: "on" } imports
 */
export function createLazyImportProxy(getter: any) {
    return new Proxy(() => {}, {
        apply: (_, __, args) => {
            return getter().default?.(...args);
        },
        get: (_, p: string) => getter()?.default?.[p] ?? getter()?.[p],
        getPrototypeOf: () =>
            new Proxy(
                {},
                {
                    get: (_, p: string) => getter()?.[p],
                },
            ),
    });
}
