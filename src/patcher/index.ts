import { getPatchFunc } from "./patcher";

const before = getPatchFunc("b");
const instead = getPatchFunc("i");
const after = getPatchFunc("a");

export { before, instead, after };
