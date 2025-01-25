import { debounce } from "es-toolkit";
import { writeFile } from "@api/fs";

const state: { [key in string]?: string } = window.__WINTRY_KV_STORAGE__ ?? {};

const saveState = debounce(() => {
    const script = `globalThis.__WINTRY_KV_STORAGE__=${JSON.stringify(state)}`;
    writeFile("preload/wt-kvStorage.js", script);
}, 500);

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
