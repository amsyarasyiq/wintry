import { internal_getDefiner } from "@metro/internal/registry";
import hookDefineProperty from "./utils/objects";

Object.freeze = Object.seal = Object;

const unhook = hookDefineProperty(global, "__d", define => {
    unhook!();

    // @ts-ignore - __d is an internal RN function exposed by Metro
    global.__d = internal_getDefiner(define, runFactory => {
        require("./index").initializeWintry();
        runFactory();
    });
});
