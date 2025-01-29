import { debounce } from "es-toolkit";
import { writeFile } from "@api/fs";
import { LoaderPayload } from "@native/loader";

const state: { [key in string]?: string } = JSON.parse(LoaderPayload.preload?.["kv.json"] ?? "{}");

const saveState = debounce(() => {
    writeFile("preload/kv.json", JSON.stringify(state));
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
