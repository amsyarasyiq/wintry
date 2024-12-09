import { memoize, toDefaulted } from "es-toolkit/compat";
import EmitterTree from "../../utils/EmitterTree";
import { proxyLazy } from "../../utils/lazy";
import { kvStorage } from "../kvStorage";

type DefaultValueGetter<T extends object> = (data: { target: T; key: string; root: T; path: string }) => any;

const _storeAccessSymbol = Symbol.for("wintry.StoreAccessSymbol");

export default class SettingsStore<T extends object> {
    static StoreAccessSymbol: typeof _storeAccessSymbol = _storeAccessSymbol;

    emitter = new EmitterTree<{
        [key in string]: [{ path: string; value: any }];
    }>();

    public declare proxy: T & { [_storeAccessSymbol]: SettingsStore<T> };

    constructor(
        name: string,
        defaultVal: T,
        private defaultGetter: DefaultValueGetter<T>,
    ) {
        this.emitter.on("*", () => {
            kvStorage.setItem(name, JSON.stringify(this.proxy));
        });

        // proxyLazy because kvStorage could not be ready
        const stored = proxyLazy(() => toDefaulted(JSON.parse(kvStorage.getItem(name) ?? "{}"), defaultVal));
        this.proxy = this.createObservableProxy(stored);
    }

    addChangeListener(path: string, listener: Parameters<typeof EmitterTree.prototype.on>[1]) {
        this.emitter.on(path, listener);
        return this;
    }

    addOnceChangeListener(path: string, listener: Parameters<typeof EmitterTree.prototype.once>[1]) {
        this.emitter.once(path, listener);
        return this;
    }

    removeChangeListener(path: string, listener: Parameters<typeof EmitterTree.prototype.off>[1]) {
        this.emitter.off(path, listener);
        return this;
    }

    private createObservableProxy(data: T, path = "") {
        return this.observeImpl(data, data, path, this.emitter, this.defaultGetter);
    }

    private observeImpl<T extends object>(
        root: T,
        data: unknown,
        path: string,
        events: typeof this.emitter,
        getDefaultValue: DefaultValueGetter<T>,
    ): T & { [_storeAccessSymbol]: SettingsStore<T> } {
        const getPath = memoize((key: string) => `${path}${path && "."}${key}`);

        return new Proxy<any>(data, {
            has: (target, key: string) => key in target && target[key] !== undefined,
            get: (target, key: string) => {
                if ((key as unknown as symbol) === SettingsStore.StoreAccessSymbol) return this;

                let v = target[key];

                if (!v) {
                    const defaultVal = getDefaultValue({ target, key, root, path });
                    if (defaultVal !== undefined) {
                        v = defaultVal;
                        target[key] = defaultVal;
                        events.emit(getPath(key), { path: getPath(key), value: v });
                    }
                }

                if (typeof v === "object" && v !== null) {
                    return this.observeImpl(root, v, getPath(key), events, getDefaultValue);
                }

                return v;
            },
            set: (target, key: string, value) => {
                if (target[key] === value) return true;

                Reflect.set(target, key, value);
                events.emit(getPath(key), { path: getPath(key), value });

                return true;
            },
            deleteProperty: (target, key: string) => {
                if (key in target) {
                    target[key] = undefined;
                    events.emit(getPath(key), { path: getPath(key), value: undefined });

                    return true;
                }

                return false;
            },
        });
    }
}
