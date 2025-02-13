import type * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Option from "effect/Option";
import type * as ParseResult from "effect/ParseResult";
import * as Schema from "effect/Schema";
import type { ParseOptions } from "effect/SchemaAST";
/**
 * @since 1.0.0
 * @category models
 */
export interface UrlParams extends ReadonlyArray<readonly [string, string]> {
}
/**
 * @since 1.0.0
 * @category models
 */
export type Input = Readonly<Record<string, Coercible | ReadonlyArray<Coercible>>> | Iterable<readonly [string, Coercible]> | URLSearchParams;
/**
 * @since 1.0.0
 * @category models
 */
export type Coercible = string | number | bigint | boolean | null | undefined;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const fromInput: (input: Input) => UrlParams;
/**
 * @since 1.0.0
 * @category schemas
 */
export declare const schema: Schema.Schema<UrlParams, ReadonlyArray<readonly [string, string]>>;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const empty: UrlParams;
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const getAll: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => ReadonlyArray<string>;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): ReadonlyArray<string>;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const getFirst: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => Option.Option<string>;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): Option.Option<string>;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const getLast: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => Option.Option<string>;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): Option.Option<string>;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const set: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (key: string, value: Coercible): (self: UrlParams) => UrlParams;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, key: string, value: Coercible): UrlParams;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const setAll: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (input: Input): (self: UrlParams) => UrlParams;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, input: Input): UrlParams;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const append: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (key: string, value: Coercible): (self: UrlParams) => UrlParams;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, key: string, value: Coercible): UrlParams;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const appendAll: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (input: Input): (self: UrlParams) => UrlParams;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, input: Input): UrlParams;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const remove: {
    /**
     * @since 1.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => UrlParams;
    /**
     * @since 1.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): UrlParams;
};
/**
 * @since 1.0.0
 * @category combinators
 */
export declare const toString: (self: UrlParams) => string;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const makeUrl: (url: string, params: UrlParams, hash: Option.Option<string>) => Either.Either<URL, Error>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schemaJson: <A, I, R>(schema: Schema.Schema<A, I, R>, options?: ParseOptions | undefined) => {
    (field: string): (self: UrlParams) => Effect.Effect<A, ParseResult.ParseError, R>;
    (self: UrlParams, field: string): Effect.Effect<A, ParseResult.ParseError, R>;
};
//# sourceMappingURL=UrlParams.d.ts.map