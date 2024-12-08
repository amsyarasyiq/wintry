import EventTree from "../utils/EventTree";
import { memoize } from "es-toolkit";
import { kvStorage } from "./kvStorage";
import { Plugins } from "../plugins";
import { proxyLazy } from "../utils/lazy";

type ChangeData = { path: string; value: any };
type DefaultValueGetter<T extends object> = (data: { target: T; key: string; root: T; path: string }) => any;

interface WintrySettings {
    plugins: {
        [plugin: string]: {
            enabled: boolean;
            [setting: string]: any;
        };
    };
}

class Settings<T extends object> {
    events = new EventTree<ChangeData>();

    public declare store: T;

    constructor(
        name: string,
        defaultVal: T,
        private defaultGetter: DefaultValueGetter<T>,
    ) {
        this.events.on("*", () => {
            kvStorage.setItem(name, JSON.stringify(this.store));
        });

        if (!kvStorage.getItem(name)) kvStorage.setItem(name, JSON.stringify(defaultVal));
        this.store = this.createObservableProxy(JSON.parse(kvStorage.getItem(name)!));
    }

    private createObservableProxy(data: T, path = "") {
        return this.observeImpl(data, data, path, this.events, this.defaultGetter);
    }

    private observeImpl<T extends object>(
        root: T,
        data: unknown,
        path: string,
        event: EventTree<ChangeData>,
        getDefaultValue: DefaultValueGetter<T>,
    ) {
        const getPath = memoize((key: string) => `${path}${path && "."}${key}`);

        return <T>new Proxy<any>(data, {
            has: (target, key: string) => key in target && target[key] !== undefined,
            get: (target, key: string) => {
                let v = target[key];

                if (!v && getDefaultValue) {
                    const defaultVal = getDefaultValue({ target, key, root, path });
                    if (defaultVal !== undefined) {
                        v = defaultVal;
                        target[key] = defaultVal;
                        event.emit(getPath(key), { path: getPath(key), value: v });
                    }
                }

                if (typeof v === "object" && v !== null) {
                    return this.observeImpl(root, v, getPath(key), event, getDefaultValue);
                }

                return v;
            },
            set: (target, key: string, value) => {
                if (target[key] === value) return true;

                Reflect.set(target, key, value);
                event.emit(getPath(key), { path: getPath(key), value });

                return true;
            },
            deleteProperty: (target, key: string) => {
                if (key in target) {
                    target[key] = undefined;
                    event.emit(getPath(key), { path: getPath(key), value: undefined });

                    return true;
                }

                return false;
            },
        });
    }
}

// TODO(refactor): This is pretty ugly, move proxyLazy inside the class
// We need proxyLazy since the constructor loads from MMKV which is not available at top level
export default proxyLazy(
    () =>
        new Settings<WintrySettings>(
            "settings",
            {
                plugins: {},
            },
            ({ key, path }) => {
                if (path === "plugins" && key in Plugins) {
                    return { enabled: Plugins[key].preenabled !== false || Plugins[key].required || false };
                }
            },
        ),
    { hint: "object" },
);
