import { debounce } from "es-toolkit";
import { CacheModule } from "../native";

let state: { [key in string]?: string } = null!;

const STORAGE_STATE_KEY = "__wintry_storage_state_key__";

const saveState = debounce(() => {
    CacheModule.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
}, 500);

/** @internal */
export async function setupMmkv() {
    const savedState = await CacheModule.getItem(STORAGE_STATE_KEY);
    if (savedState == null) {
        state = {};
    } else {
        try {
            state = JSON.parse(savedState);
        } catch (e) {
            throw new Error("Failed to parse Wintry's storage state", { cause: e });
        }
    }
}

function getItem(key: string) {
    return state[key] || null;
}

function setItem(key: string, value: string | null) {
    if (value == null) {
        delete state[key];
    } else {
        state[key] = value;
    }
    saveState();
}

function removeItem(key: string) {
    delete state[key];
    saveState();
}

export const kvStorage = {
    getItem,
    setItem,
    removeItem,
};
