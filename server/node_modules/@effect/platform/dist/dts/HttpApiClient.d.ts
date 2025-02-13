import * as Effect from "effect/Effect";
import type { Scope } from "effect/Scope";
import type { Simplify } from "effect/Types";
import * as HttpApi from "./HttpApi.js";
import type { HttpApiEndpoint } from "./HttpApiEndpoint.js";
import type { HttpApiGroup } from "./HttpApiGroup.js";
import * as HttpClient from "./HttpClient.js";
import * as HttpClientError from "./HttpClientError.js";
import type { HttpApiMiddleware } from "./index.js";
/**
 * @since 1.0.0
 * @category models
 */
export type Client<Groups extends HttpApiGroup.Any, ApiError> = Simplify<{
    readonly [Group in Extract<Groups, {
        readonly topLevel: false;
    }> as HttpApiGroup.Name<Group>]: [Group] extends [
        HttpApiGroup<infer _GroupName, infer _Endpoints, infer _GroupError, infer _GroupErrorR>
    ] ? {
        readonly [Endpoint in _Endpoints as HttpApiEndpoint.Name<Endpoint>]: Client.Method<Endpoint, ApiError, _GroupError>;
    } : never;
} & {
    readonly [Method in Client.TopLevelMethods<Groups, ApiError> as Method[0]]: Method[1];
}>;
/**
 * @since 1.0.0
 * @category models
 */
export declare namespace Client {
    /**
     * @since 1.0.0
     * @category models
     */
    type Method<Endpoint, ApiError, GroupError> = [Endpoint] extends [
        HttpApiEndpoint<infer _Name, infer _Method, infer _Path, infer _UrlParams, infer _Payload, infer _Headers, infer _Success, infer _Error, infer _R, infer _RE>
    ] ? (request: Simplify<HttpApiEndpoint.ClientRequest<_Path, _UrlParams, _Payload, _Headers>>) => Effect.Effect<_Success, _Error | GroupError | ApiError | HttpClientError.HttpClientError> : never;
    /**
     * @since 1.0.0
     * @category models
     */
    type TopLevelMethods<Groups extends HttpApiGroup.Any, ApiError> = Extract<Groups, {
        readonly topLevel: true;
    }> extends HttpApiGroup<infer _Id, infer _Endpoints, infer _Error, infer _ErrorR, infer _TopLevel> ? _Endpoints extends infer Endpoint ? [HttpApiEndpoint.Name<Endpoint>, Client.Method<Endpoint, ApiError, _Error>] : never : never;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const make: <Groups extends HttpApiGroup.Any, ApiError, ApiR>(api: HttpApi.HttpApi<Groups, ApiError, ApiR>, options?: {
    readonly transformClient?: ((client: HttpClient.HttpClient) => HttpClient.HttpClient) | undefined;
    readonly transformResponse?: ((effect: Effect.Effect<unknown, unknown, Scope>) => Effect.Effect<unknown, unknown, Scope>) | undefined;
    readonly baseUrl?: string | undefined;
}) => Effect.Effect<Simplify<Client<Groups, ApiError>>, never, HttpApiMiddleware.HttpApiMiddleware.Without<ApiR | HttpApiGroup.ClientContext<Groups>> | HttpClient.HttpClient>;
//# sourceMappingURL=HttpApiClient.d.ts.map