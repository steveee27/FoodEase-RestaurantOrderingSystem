/**
 * @since 1.0.0
 */
import * as Chunk from "effect/Chunk";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as FiberRef from "effect/FiberRef";
import { identity } from "effect/Function";
import { globalValue } from "effect/GlobalValue";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Option from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import { pipeArguments } from "effect/Pipeable";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { unify } from "effect/Unify";
import * as HttpApi from "./HttpApi.js";
import { HttpApiDecodeError } from "./HttpApiError.js";
import * as HttpApiMiddleware from "./HttpApiMiddleware.js";
import * as HttpApiSchema from "./HttpApiSchema.js";
import * as HttpApp from "./HttpApp.js";
import * as HttpMethod from "./HttpMethod.js";
import * as HttpMiddleware from "./HttpMiddleware.js";
import * as HttpRouter from "./HttpRouter.js";
import * as HttpServer from "./HttpServer.js";
import * as HttpServerRequest from "./HttpServerRequest.js";
import * as HttpServerResponse from "./HttpServerResponse.js";
import * as OpenApi from "./OpenApi.js";
/**
 * The router that the API endpoints are attached to.
 *
 * @since 1.0.0
 * @category router
 */
export class Router extends /*#__PURE__*/HttpRouter.Tag("@effect/platform/HttpApiBuilder/Router")() {}
/**
 * Create a top-level `HttpApi` layer.
 *
 * @since 1.0.0
 * @category constructors
 */
export const api = api => Layer.effect(HttpApi.Api, Effect.map(Effect.context(), context => ({
  api: api,
  context
})));
/**
 * Build an `HttpApp` from an `HttpApi` instance, and serve it using an
 * `HttpServer`.
 *
 * Optionally, you can provide a middleware function that will be applied to
 * the `HttpApp` before serving.
 *
 * @since 1.0.0
 * @category constructors
 */
export const serve = middleware => httpApp.pipe(Effect.map(app => HttpServer.serve(app, middleware)), Layer.unwrapEffect, Layer.provide(Router.Live));
/**
 * Construct an `HttpApp` from an `HttpApi` instance.
 *
 * @since 1.0.0
 * @category constructors
 */
export const httpApp = /*#__PURE__*/Effect.gen(function* () {
  const {
    api,
    context
  } = yield* HttpApi.Api;
  const middleware = makeMiddlewareMap(api.middlewares, context);
  const router = applyMiddleware(middleware, yield* Router.router);
  const apiMiddleware = yield* Effect.serviceOption(Middleware);
  const errorSchema = makeErrorSchema(api);
  const encodeError = Schema.encodeUnknown(errorSchema);
  return router.pipe(apiMiddleware._tag === "Some" ? apiMiddleware.value : identity, Effect.catchAll(error => Effect.matchEffect(Effect.provide(encodeError(error), context), {
    onFailure: () => Effect.die(error),
    onSuccess: Effect.succeed
  })));
});
/**
 * Construct an http web handler from an `HttpApi` instance.
 *
 * @since 1.0.0
 * @category constructors
 * @example
 * import { HttpApi, HttpApiBuilder, HttpServer } from "@effect/platform"
 * import { Layer } from "effect"
 *
 * class MyApi extends HttpApi.empty {}
 *
 * const MyApiLive = HttpApiBuilder.api(MyApi)
 *
 * const { dispose, handler } = HttpApiBuilder.toWebHandler(
 *   Layer.mergeAll(
 *     MyApiLive,
 *     // you could also use NodeHttpServer.layerContext, depending on your
 *     // server's platform
 *     HttpServer.layerContext
 *   )
 * )
 */
export const toWebHandler = (layer, options) => {
  const runtime = ManagedRuntime.make(Layer.merge(layer, Router.Live), options?.memoMap);
  let handlerCached;
  const handlerPromise = httpApp.pipe(Effect.bindTo("httpApp"), Effect.bind("runtime", () => runtime.runtimeEffect), Effect.map(({
    httpApp,
    runtime
  }) => HttpApp.toWebHandlerRuntime(runtime)(options?.middleware ? options.middleware(httpApp) : httpApp)), Effect.tap(handler => {
    handlerCached = handler;
  }), runtime.runPromise);
  function handler(request) {
    if (handlerCached !== undefined) {
      return handlerCached(request);
    }
    return handlerPromise.then(handler => handler(request));
  }
  return {
    handler,
    dispose: runtime.dispose
  };
};
/**
 * @since 1.0.0
 * @category handlers
 */
export const HandlersTypeId = /*#__PURE__*/Symbol.for("@effect/platform/HttpApiBuilder/Handlers");
const HandlersProto = {
  [HandlersTypeId]: {
    _Endpoints: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
  handle(name, handler) {
    const endpoint = HashMap.unsafeGet(this.group.endpoints, name);
    return makeHandlers({
      group: this.group,
      handlers: Chunk.append(this.handlers, {
        endpoint,
        handler,
        withFullResponse: false
      })
    });
  },
  handleRaw(name, handler) {
    const endpoint = HashMap.unsafeGet(this.group.endpoints, name);
    return makeHandlers({
      group: this.group,
      handlers: Chunk.append(this.handlers, {
        endpoint,
        handler,
        withFullResponse: true
      })
    });
  }
};
const makeHandlers = options => {
  const self = Object.create(HandlersProto);
  self.group = options.group;
  self.handlers = options.handlers;
  return self;
};
/**
 * Create a `Layer` that will implement all the endpoints in an `HttpApi`.
 *
 * An unimplemented `Handlers` instance is passed to the `build` function, which
 * you can use to add handlers to the group.
 *
 * You can implement endpoints using the `handlers.handle` api.
 *
 * @since 1.0.0
 * @category handlers
 */
export const group = (api, groupName, build) => Router.use(router => Effect.gen(function* () {
  const context = yield* Effect.context();
  const group = HashMap.unsafeGet(api.groups, groupName);
  const result = build(makeHandlers({
    group,
    handlers: Chunk.empty()
  }));
  const handlers = Effect.isEffect(result) ? yield* result : result;
  const groupMiddleware = makeMiddlewareMap(group.middlewares, context);
  const routes = [];
  for (const item of handlers.handlers) {
    const middleware = makeMiddlewareMap(item.endpoint.middlewares, context, groupMiddleware);
    routes.push(handlerToRoute(item.endpoint, middleware, function (request) {
      return Effect.mapInputContext(item.handler(request), input => Context.merge(context, input));
    }, item.withFullResponse));
  }
  yield* router.concat(HttpRouter.fromIterable(routes));
}));
/**
 * Create a `Handler` for a single endpoint.
 *
 * @since 1.0.0
 * @category handlers
 */
export const handler = (_api, _groupName, _name, f) => f;
// internal
const requestPayload = (request, urlParams, isMultipart) => HttpMethod.hasBody(request.method) ? isMultipart ? Effect.orDie(request.multipart) : Effect.orDie(request.json) : Effect.succeed(urlParams);
const makeMiddlewareMap = (middleware, context, initial) => {
  const map = new Map(initial);
  HashSet.forEach(middleware, tag => {
    map.set(tag.key, {
      tag,
      effect: Context.unsafeGet(context, tag)
    });
  });
  return map;
};
const handlerToRoute = (endpoint_, middleware, handler, isFullResponse) => {
  const endpoint = endpoint_;
  const decodePath = Option.map(endpoint.pathSchema, Schema.decodeUnknown);
  const isMultipart = endpoint.payloadSchema.pipe(Option.map(schema => HttpApiSchema.getMultipart(schema.ast)), Option.getOrElse(() => false));
  const decodePayload = Option.map(endpoint.payloadSchema, Schema.decodeUnknown);
  const decodeHeaders = Option.map(endpoint.headersSchema, Schema.decodeUnknown);
  const decodeUrlParams = Option.map(endpoint.urlParamsSchema, Schema.decodeUnknown);
  const encodeSuccess = Schema.encode(makeSuccessSchema(endpoint.successSchema));
  return HttpRouter.makeRoute(endpoint.method, endpoint.path, applyMiddleware(middleware, Effect.withFiberRuntime(fiber => {
    const context = fiber.getFiberRef(FiberRef.currentContext);
    const request = Context.unsafeGet(context, HttpServerRequest.HttpServerRequest);
    const routeContext = Context.unsafeGet(context, HttpRouter.RouteContext);
    const urlParams = Context.unsafeGet(context, HttpServerRequest.ParsedSearchParams);
    return (decodePath._tag === "Some" ? decodePath.value(routeContext.params) : Effect.succeed(routeContext.params)).pipe(Effect.bindTo("pathParams"), decodePayload._tag === "Some" ? Effect.bind("payload", _ => Effect.flatMap(requestPayload(request, urlParams, isMultipart), decodePayload.value)) : identity, decodeHeaders._tag === "Some" ? Effect.bind("headers", _ => decodeHeaders.value(request.headers)) : identity, decodeUrlParams._tag === "Some" ? Effect.bind("urlParams", _ => decodeUrlParams.value(urlParams)) : identity, Effect.flatMap(input => {
      const request = {
        path: input.pathParams
      };
      if ("payload" in input) {
        request.payload = input.payload;
      }
      if ("headers" in input) {
        request.headers = input.headers;
      }
      if ("urlParams" in input) {
        request.urlParams = input.urlParams;
      }
      return handler(request);
    }), isFullResponse ? identity : Effect.flatMap(encodeSuccess), Effect.catchIf(ParseResult.isParseError, HttpApiDecodeError.refailParseError));
  })));
};
const applyMiddleware = (middleware, handler) => {
  for (const entry of middleware.values()) {
    const effect = HttpApiMiddleware.SecurityTypeId in entry.tag ? makeSecurityMiddleware(entry) : entry.effect;
    if (entry.tag.optional) {
      const previous = handler;
      handler = Effect.matchEffect(effect, {
        onFailure: () => previous,
        onSuccess: entry.tag.provides !== undefined ? value => Effect.provideService(previous, entry.tag.provides, value) : _ => previous
      });
    } else {
      handler = entry.tag.provides !== undefined ? Effect.provideServiceEffect(handler, entry.tag.provides, effect) : Effect.zipRight(effect, handler);
    }
  }
  return handler;
};
const securityMiddlewareCache = /*#__PURE__*/globalValue("securityMiddlewareCache", () => new WeakMap());
const makeSecurityMiddleware = entry => {
  if (securityMiddlewareCache.has(entry.tag)) {
    return securityMiddlewareCache.get(entry.tag);
  }
  let effect;
  for (const [key, security] of Object.entries(entry.tag.security)) {
    const decode = securityDecode(security);
    const handler = entry.effect[key];
    const middleware = Effect.flatMap(decode, handler);
    effect = effect === undefined ? middleware : Effect.catchAll(effect, () => middleware);
  }
  if (effect === undefined) {
    effect = Effect.void;
  }
  securityMiddlewareCache.set(entry.tag, effect);
  return effect;
};
const responseSchema = /*#__PURE__*/Schema.declare(HttpServerResponse.isServerResponse);
const makeSuccessSchema = schema => {
  const schemas = new Set();
  HttpApiSchema.deunionize(schemas, schema);
  return Schema.Union(...Array.from(schemas, toResponseSuccess));
};
const makeErrorSchema = api => {
  const schemas = new Set();
  HttpApiSchema.deunionize(schemas, api.errorSchema);
  HashMap.forEach(api.groups, group => {
    HashMap.forEach(group.endpoints, endpoint => {
      HttpApiSchema.deunionize(schemas, endpoint.errorSchema);
    });
    HttpApiSchema.deunionize(schemas, group.errorSchema);
  });
  return Schema.Union(...Array.from(schemas, toResponseError));
};
const decodeForbidden = (_, __, ast) => ParseResult.fail(new ParseResult.Forbidden(ast, _, "Encode only schema"));
const toResponseSchema = getStatus => {
  const cache = new WeakMap();
  const schemaToResponse = (data, _, ast) => {
    const isEmpty = HttpApiSchema.isVoid(ast.to);
    const status = getStatus(ast.to);
    if (isEmpty) {
      return HttpServerResponse.empty({
        status
      });
    }
    const encoding = HttpApiSchema.getEncoding(ast.to);
    switch (encoding.kind) {
      case "Json":
        {
          return Effect.mapError(HttpServerResponse.json(data, {
            status,
            contentType: encoding.contentType
          }), error => new ParseResult.Type(ast, error, "Could not encode to JSON"));
        }
      case "Text":
        {
          return ParseResult.succeed(HttpServerResponse.text(data, {
            status,
            contentType: encoding.contentType
          }));
        }
      case "Uint8Array":
        {
          return ParseResult.succeed(HttpServerResponse.uint8Array(data, {
            status,
            contentType: encoding.contentType
          }));
        }
      case "UrlParams":
        {
          return ParseResult.succeed(HttpServerResponse.urlParams(data, {
            status,
            contentType: encoding.contentType
          }));
        }
    }
  };
  return schema => {
    if (cache.has(schema.ast)) {
      return cache.get(schema.ast);
    }
    const transform = Schema.transformOrFail(responseSchema, schema, {
      decode: decodeForbidden,
      encode: schemaToResponse
    });
    cache.set(transform.ast, transform);
    return transform;
  };
};
const toResponseSuccess = /*#__PURE__*/toResponseSchema(HttpApiSchema.getStatusSuccessAST);
const toResponseError = /*#__PURE__*/toResponseSchema(HttpApiSchema.getStatusErrorAST);
// ----------------------------------------------------------------------------
// Global middleware
// ----------------------------------------------------------------------------
/**
 * @since 1.0.0
 * @category middleware
 */
export class Middleware extends /*#__PURE__*/Context.Tag("@effect/platform/HttpApiBuilder/Middleware")() {}
const middlewareAdd = middleware => Effect.map(Effect.context(), context => {
  const current = Context.getOption(context, Middleware);
  const withContext = httpApp => Effect.mapInputContext(middleware(httpApp), input => Context.merge(context, input));
  return current._tag === "None" ? withContext : httpApp => withContext(current.value(httpApp));
});
const middlewareAddNoContext = middleware => Effect.map(Effect.serviceOption(Middleware), current => {
  return current._tag === "None" ? middleware : httpApp => middleware(current.value(httpApp));
});
/**
 * Create an `HttpApi` level middleware `Layer`.
 *
 * @since 1.0.0
 * @category middleware
 */
export const middleware = (...args) => {
  const apiFirst = HttpApi.isHttpApi(args[0]);
  const withContext = apiFirst ? args[2]?.withContext === true : args[1]?.withContext === true;
  const add = withContext ? middlewareAdd : middlewareAddNoContext;
  const middleware = apiFirst ? args[1] : args[0];
  return Effect.isEffect(middleware) ? Layer.effect(Middleware, Effect.flatMap(middleware, add)) : Layer.effect(Middleware, add(middleware));
};
/**
 * Create an `HttpApi` level middleware `Layer`, that has a `Scope` provided to
 * the constructor.
 *
 * @since 1.0.0
 * @category middleware
 */
export const middlewareScoped = (...args) => {
  const apiFirst = HttpApi.isHttpApi(args[0]);
  const withContext = apiFirst ? args[2]?.withContext === true : args[1]?.withContext === true;
  const add = withContext ? middlewareAdd : middlewareAddNoContext;
  const middleware = apiFirst ? args[1] : args[0];
  return Layer.scoped(Middleware, Effect.flatMap(middleware, add));
};
/**
 * A CORS middleware layer that can be provided to the `HttpApiBuilder.serve` layer.
 *
 * @since 1.0.0
 * @category middleware
 */
export const middlewareCors = options => middleware(HttpMiddleware.cors(options));
/**
 * A middleware that adds an openapi.json endpoint to the API.
 *
 * @since 1.0.0
 * @category middleware
 */
export const middlewareOpenApi = options => Router.use(router => Effect.gen(function* () {
  const {
    api
  } = yield* HttpApi.Api;
  const spec = OpenApi.fromApi(api);
  const response = yield* HttpServerResponse.json(spec).pipe(Effect.orDie);
  yield* router.get(options?.path ?? "/openapi.json", Effect.succeed(response));
}));
const bearerLen = `Bearer `.length;
/**
 * @since 1.0.0
 * @category security
 */
export const securityDecode = self => {
  switch (self._tag) {
    case "Bearer":
      {
        return Effect.map(HttpServerRequest.HttpServerRequest, request => Redacted.make((request.headers.authorization ?? "").slice(bearerLen)));
      }
    case "ApiKey":
      {
        const schema = Schema.Struct({
          [self.key]: Schema.String
        });
        const decode = unify(self.in === "query" ? HttpServerRequest.schemaSearchParams(schema) : self.in === "cookie" ? HttpServerRequest.schemaCookies(schema) : HttpServerRequest.schemaHeaders(schema));
        return Effect.match(decode, {
          onFailure: () => Redacted.make(""),
          onSuccess: match => Redacted.make(match[self.key])
        });
      }
    case "Basic":
      {
        const empty = {
          username: "",
          password: Redacted.make("")
        };
        return HttpServerRequest.HttpServerRequest.pipe(Effect.flatMap(request => Encoding.decodeBase64String(request.headers.authorization ?? "")), Effect.match({
          onFailure: () => empty,
          onSuccess: header => {
            const parts = header.split(":");
            if (parts.length !== 2) {
              return empty;
            }
            return {
              username: parts[0],
              password: Redacted.make(parts[1])
            };
          }
        }));
      }
  }
};
/**
 * Set a cookie from an `HttpApiSecurity.HttpApiKey` instance.
 *
 * You can use this api before returning a response from an endpoint handler.
 *
 * ```ts
 * handlers.handle(
 *   "authenticate",
 *   (_) => HttpApiBuilder.securitySetCookie(security, "secret123")
 * )
 * ```
 *
 * @since 1.0.0
 * @category middleware
 */
export const securitySetCookie = (self, value, options) => {
  const stringValue = typeof value === "string" ? value : Redacted.value(value);
  return HttpApp.appendPreResponseHandler((_req, response) => Effect.orDie(HttpServerResponse.setCookie(response, self.key, stringValue, {
    secure: true,
    httpOnly: true,
    ...options
  })));
};
//# sourceMappingURL=HttpApiBuilder.js.map