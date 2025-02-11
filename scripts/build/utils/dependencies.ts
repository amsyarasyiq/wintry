import { type KeyValueProperty, parseFile, type StringLiteral } from "@swc/core";
import path from "path";

export async function getDependenciesMap(): Promise<string[]> {
    const ast = await parseFile(path.resolve("./shims/depsModule.ts"));

    const lastNode = ast.body.at(-1);

    if (!lastNode || lastNode.type !== "ExportDefaultExpression") {
        throw new Error("Invalid AST structure, expected ExportDefaultExpression");
    }

    if (lastNode.expression.type !== "ObjectExpression") {
        throw new Error("Invalid AST structure, expected ObjectExpression");
    }

    if (!Array.isArray(lastNode.expression.properties)) {
        throw new Error("Invalid AST structure, expected properties array");
    }

    return lastNode.expression.properties
        .filter((p): p is KeyValueProperty => p.type === "KeyValueProperty")
        .filter(p => p.key.type === "StringLiteral")
        .map(p => (p.key as StringLiteral).value);
}
