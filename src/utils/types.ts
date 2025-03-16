export type AnyRecord = Record<PropertyKey, any>;

export type SnakeCaseToKebab<S extends string> = S extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}-${SnakeCaseToKebab<Rest>}`
    : Lowercase<S>;

/**
 * Converts all function properties of an object to be called with different `this`
 */
export type WithThis<T, This> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R ? (this: This, ...args: A) => R : T[P];
};
