export type AnyRecord = Record<PropertyKey, any>;

export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

export type SnakeCaseToKebab<S extends string> = S extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}-${SnakeCaseToKebab<Rest>}`
    : Lowercase<S>;

/**
 * Converts all function properties of an object to be called with different `this`
 */
export type WithThis<T, This> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (this: This, ...args: A) => R : T[P];
};

/**
 * Extracts the keys from type `T` whose names match the string pattern `Pattern`.
 *
 * @template T - The object type to extract keys from.
 * @template Pattern - The string pattern to match keys against (typically a string literal or union of string literals).
 * @returns A union of keys from `T` that extend (match) `Pattern`.
 *
 * @example
 * type Example = { foo: string; _bar: number; _bazValue: boolean };
 * type Keys = KeysMatching<Example, '_${string}'>; // "_bar" | "_bazValue"
 */
export type KeysMatching<T, Pattern extends string> = Exclude<
    {
        [K in keyof T]: K extends Pattern ? K : never;
    }[keyof T],
    undefined
>;
