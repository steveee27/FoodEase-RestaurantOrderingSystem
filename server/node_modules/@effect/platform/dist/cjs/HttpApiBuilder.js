"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toWebHandler = exports.serve = exports.securitySetCookie = exports.securityDecode = exports.middlewareScoped = exports.middlewareOpenApi = exports.middlewareCors = exports.middleware = exports.httpApp = exports.handler = exports.group = exports.api = exports.Router = exports.Middleware = exports.HandlersTypeId = void 0;
var Chunk = _interopRequireWildcard(require("effect/Chunk"));
var Context = _interopRequireWildcard(require("effect/Context"));
var Effect = _interopRequireWildcard(require("effect/Effect"));
var Encoding = _interopRequireWildcard(require("effect/Encoding"));
var FiberRef = _interopRequireWildcard(require("effect/FiberRef"));
var _Function = require("effect/Function");
var _GlobalValue = require("effect/GlobalValue");
var HashMap = _interopRequireWildcard(require("effect/HashMap"));
var HashSet = _interopRequireWildcard(require("effect/HashSet"));
var Layer = _interopRequireWildcard(require("effect/Layer"));
var ManagedRuntime = _interopRequireWildcard(require("effect/ManagedRuntime"));
var Option = _interopRequireWildcard(require("effect/Option"));
var ParseResult = _interopRequireWildcard(require("effect/ParseResult"));
var _Pipeable = require("effect/Pipeable");
var Redacted = _interopRequireWildcard(require("effect/Redacted"));
var Schema = _interopRequireWildcard(require("effect/Schema"));
var _Unify = require("effect/Unify");
var HttpApi = _interopRequireWildcard(require("./HttpApi.js"));
var _HttpApiError = require("./HttpApiError.js");
var HttpApiMiddleware = _interopRequireWildcard(require("./HttpApiMiddleware.js"));
var HttpApiSchema = _interopRequireWildcard(require("./HttpApiSchema.js"));
var HttpApp = _interopRequireWildcard(require("./HttpApp.js"));
var HttpMethod = _interopRequireWildcard(require("./HttpMethod.js"));
var HttpMiddleware = _interopRequireWildcard(require("./HttpMiddleware.js"));
var HttpRouter = _interopRequireWildcard(require("./HttpRouter.js"));
var HttpServer = _interopRequireWildcard(require("./HttpServer.js"));
var HttpServerRequest = _interopRequireWildcard(require("./HttpServerRequest.js"));
var HttpServerResponse = _interopRequireWildcard(require("./HttpServerResponse.js"));
var OpenApi = _interopRequireWildcard(require("./OpenApi.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @since 1.0.0
 */

/**
 * The router that the API endpoints are attached to.
 *
 * @since 1.0.0
 * @category router
 */
class Router extends /*#__PURE__*/HttpRouter.Tag("@effect/platform/HttpApiBuilder/Router")() {}
/**
 * Create a top-level `HttpApi` layer.
 *
 * @since 1.0.0
 * @category constructors
 */
exports.Router = Router;
const api = api => Layer.effect(HttpApi.Api, Effect.map(Effect.context(), context => ({
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
exports.api = api;
const serve = middleware => httpApp.pipe(Effect.map(app => HttpServer.serve(app, middleware)), Layer.unwrapEffect, Layer.provide(Router.Live));
/**
 * Construct an `HttpApp` from an `HttpApi` instance.
 *
 * @since 1.0.0
 * @category constructors
 */
exports.serve = serve;
const httpApp = exports.httpApp = /*#__PURE__*/Effect.gen(function* () {
  const {
    api,
    context
  } = yield* HttpApi.Api;
  const middleware = makeMiddlewareMap(api.middlewares, context);
  const router = applyMiddleware(middleware, yield* Router.router);
  const apiMiddleware = yield* Effect.serviceOption(Middleware);
  const errorSchema = makeErrorSchema(api);
  const encodeError = Schema.encodeUnknown(errorSchema);
  return router.pipe(apiMiddleware._tag === "Some" ? apiMiddleware.value : _Function.identity, Effect.catchAll(error => Effect.matchEffect(Effect.provide(encodeError(error), context), {
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
const toWebHandler = (layer, options) => {
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
exports.toWebHandler = toWebHandler;
const HandlersTypeId = exports.HandlersTypeId = /*#__PURE__*/Symbol.for("@effect/platform/HttpApiBuilder/Handlers");
const HandlersProto = {
  [HandlersTypeId]: {
    _Endpoints: _Function.identity
  },
  pipe() {
    return (0, _Pipeable.pipeArguments)(this, arguments);
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
const group = (api, groupName, build) => Router.use(router => Effect.gen(function* () {
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
exports.group = group;
const handler = (_api, _groupName, _name, f) => f;
// internal
exports.handler = handler;
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
    return (decodePath._tag === "Some" ? decodePath.value(routeContext.params) : Effect.succeed(routeContext.params)).pipe(Effect.bindTo("pathParams"), decodePayload._tag === "Some" ? Effect.bind("payload", _ => Effect.flatMap(requestPayload(request, urlParams, isMultipart), decodePayload.value)) : _Function.identity, decodeHeaders._tag === "Some" ? Effect.bind("headers", _ => decodeHeaders.value(request.headers)) : _Function.identity, decodeUrlParams._tag === "Some" ? Effect.bind("urlParams", _ => decodeUrlParams.value(urlParams)) : _Function.identity, Effect.flatMap(input => {
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
    }), isFullResponse ? _Function.identity : Effect.flatMap(encodeSuccess), Effect.catchIf(ParseResult.isParseError, _HttpApiError.HttpApiDecodeError.refailParseError));
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
const securityMiddlewareCache = /*#__PURE__*/(0, _GlobalValue.globalValue)("securityMiddlewareCache", () => new WeakMap());
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
class Middleware extends /*#__PURE__*/Context.Tag("@effect/platform/HttpApiBuilder/Middleware")() {}
exports.Middleware = Middleware;
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
const middleware = (...args) => {
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
exports.middleware = middleware;
const middlewareScoped = (...args) => {
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
exports.middlewareScoped = middlewareScoped;
const middlewareCors = options => middleware(HttpMiddleware.cors(options));
/**
 * A middleware that adds an openapi.json endpoint to the API.
 *
 * @since 1.0.0
 * @category middleware
 */
exports.middlewareCors = middlewareCors;
const middlewareOpenApi = options => Router.use(router => Effect.gen(function* () {
  const {
    api
  } = yield* HttpApi.Api;
  const spec = OpenApi.fromApi(api);
  const response = yield* HttpServerResponse.json(spec).pipe(Effect.orDie);
  yield* router.get(options?.path ?? "/openapi.json", Effect.succeed(response));
}));
exports.middlewareOpenApi = middlewareOpenApi;
const bearerLen = `Bearer `.length;
/**
 * @since 1.0.0
 * @category security
 */
const securityDecode = self => {
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
        const decode = (0, _Unify.unify)(self.in === "query" ? HttpServerRequest.schemaSearchParams(schema) : self.in === "cookie" ? HttpServerRequest.schemaCookies(schema) : HttpServerRequest.schemaHeaders(schema));
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
exports.securityDecode = securityDecode;
const securitySetCookie = (self, value, options) => {
  const stringValue = typeof value === "string" ? value : Redacted.value(value);
  return HttpApp.appendPreResponseHandler((_req, response) => Effect.orDie(HttpServerResponse.setCookie(response, self.key, stringValue, {
    secure: true,
    httpOnly: true,
    ...options
  })));
};
exports.securitySetCookie = securitySetCookie;
//# sourceMappingURL=HttpApiBuilder.js.map