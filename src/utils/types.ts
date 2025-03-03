export type AnyRecord = Record<PropertyKey, any>;

export type SnakeCaseToKebab<S extends string> = S extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}-${SnakeCaseToKebab<Rest>}`
    : Lowercase<S>;
