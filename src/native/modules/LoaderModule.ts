import { callFunction, isFunctionRegistered } from "@native/loader";

export default class LoaderModule {
    constructor(
        public name: string
    ) { }

    isFunctionRegistered(function_: string) {
        return isFunctionRegistered(this.name, function_);
    }

    callFunction(function_: string, args: unknown[]) {
        return callFunction(this.name, function_, args);
    }
}