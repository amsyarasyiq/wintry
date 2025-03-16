import { debounce } from "es-toolkit";
import { writeFile } from "@api/fs";

const state: { [key in string]?: string } = (window.s = {});

const KV_FOLDER = "kv";
const KV_PREFIX = "__wt_kv/";

// Load all KV from global object
for (const key in window) {
    if (key.startsWith(KV_PREFIX)) {
        state[key.slice(KV_PREFIX.length)] = window[key];
        delete window[key];
    }
}

const saveState = debounce(() => {
    for (const key in state) {
        writeFile(`${KV_FOLDER}/${key}`, state[key]!);
    }
}, 500);

function getItem(key: string) {
    return state[key] ?? null;
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
