"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = void 0;
var Context = _interopRequireWildcard(require("effect/Context"));
var Effect = _interopRequireWildcard(require("effect/Effect"));
var _Function = require("effect/Function");
var Option = _interopRequireWildcard(require("effect/Option"));
var ParseResult = _interopRequireWildcard(require("effect/ParseResult"));
var Schema = _interopRequireWildcard(require("effect/Schema"));
var HttpApi = _interopRequireWildcard(require("./HttpApi.js"));
var HttpApiSchema = _interopRequireWildcard(require("./HttpApiSchema.js"));
var HttpClient = _interopRequireWildcard(require("./HttpClient.js"));
var HttpClientError = _interopRequireWildcard(require("./HttpClientError.js"));
var HttpClientRequest = _interopRequireWildcard(require("./HttpClientRequest.js"));
var HttpClientResponse = _interopRequireWildcard(require("./HttpClientResponse.js"));
var HttpMethod = _interopRequireWildcard(require("./HttpMethod.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category constructors
 */
const make = (api, options) => Effect.gen(function* () {
  const context = yield* Effect.context();
  const httpClient = (yield* HttpClient.HttpClient).pipe(options?.baseUrl === undefined ? _Function.identity : HttpClient.mapRequest(HttpClientRequest.prependUrl(options.baseUrl)), options?.transformClient === undefined ? _Function.identity : options.transformClient);
  const client = {};
  HttpApi.reflect(api, {
    onGroup({
      group
    }) {
      if (group.topLevel) return;
      client[group.identifier] = {};
    },
    onEndpoint({
      endpoint,
      errors,
      group,
      successes
    }) {
      const makeUrl = compilePath(endpoint.path);
      const decodeMap = {
        orElse: statusOrElse
      };
      errors.forEach((ast, status) => {
        if (ast._tag === "None") {
          decodeMap[status] = statusCodeError;
          return;
        }
        const decode = schemaToResponse(ast.value);
        decodeMap[status] = response => Effect.flatMap(decode(response), Effect.fail);
      });
      successes.forEach((ast, status) => {
        decodeMap[status] = ast._tag === "None" ? responseAsVoid : schemaToResponse(ast.value);
      });
      const isMultipart = endpoint.payloadSchema.pipe(Option.map(schema => HttpApiSchema.getMultipart(schema.ast)), Option.getOrElse(() => false));
      const encodePayload = endpoint.payloadSchema.pipe(Option.filter(() => !isMultipart), Option.map(Schema.encodeUnknown));
      const encodeHeaders = endpoint.headersSchema.pipe(Option.map(Schema.encodeUnknown));
      const encodeUrlParams = endpoint.urlParamsSchema.pipe(Option.map(Schema.encodeUnknown));
      (group.topLevel ? client : client[group.identifier])[endpoint.name] = request => {
        const url = request && request.path ? makeUrl(request.path) : endpoint.path;
        const baseRequest = HttpClientRequest.make(endpoint.method)(url);
        return (isMultipart ? Effect.succeed(baseRequest.pipe(HttpClientRequest.bodyFormData(request.payload))) : encodePayload._tag === "Some" ? encodePayload.value(request.payload).pipe(Effect.flatMap(payload => HttpMethod.hasBody(endpoint.method) ? HttpClientRequest.bodyJson(baseRequest, payload) : Effect.succeed(HttpClientRequest.setUrlParams(baseRequest, payload))), Effect.orDie) : Effect.succeed(baseRequest)).pipe(encodeHeaders._tag === "Some" ? Effect.flatMap(httpRequest => encodeHeaders.value(request.headers).pipe(Effect.orDie, Effect.map(headers => HttpClientRequest.setHeaders(httpRequest, headers)))) : _Function.identity, encodeUrlParams._tag === "Some" ? Effect.flatMap(httpRequest => encodeUrlParams.value(request.urlParams).pipe(Effect.orDie, Effect.map(params => HttpClientRequest.appendUrlParams(httpRequest, params)))) : _Function.identity, Effect.flatMap(httpClient.execute), Effect.flatMap(HttpClientResponse.matchStatus(decodeMap)), options?.transformResponse === undefined ? _Function.identity : options.transformResponse, Effect.scoped, Effect.catchIf(ParseResult.isParseError, Effect.die), Effect.mapInputContext(input => Context.merge(context, input)));
      };
    }
  });
  return client;
});
// ----------------------------------------------------------------------------
exports.make = make;
const paramsRegex = /:(\w+)[^/]*/g;
const compilePath = path => {
  const segments = path.split(paramsRegex);
  const len = segments.length;
  if (len === 1) {
    return _ => path;
  }
  return params => {
    let url = segments[0];
    for (let i = 1; i < len; i++) {
      if (i % 2 === 0) {
        url += segments[i];
      } else {
        url += params[segments[i]];
      }
    }
    return url;
  };
};
const schemaToResponse = ast => {
  const schema = Schema.make(ast);
  const encoding = HttpApiSchema.getEncoding(ast);
  const decode = Schema.decodeUnknown(schema);
  switch (encoding.kind) {
    case "Json":
      {
        return response => Effect.flatMap(responseJson(response), decode);
      }
    case "UrlParams":
      {
        return HttpClientResponse.schemaBodyUrlParams(schema);
      }
    case "Uint8Array":
      {
        return response => response.arrayBuffer.pipe(Effect.map(buffer => new Uint8Array(buffer)), Effect.flatMap(decode));
      }
    case "Text":
      {
        return response => Effect.flatMap(response.text, decode);
      }
  }
};
const responseJson = response => Effect.flatMap(response.text, text => text === "" ? Effect.void : Effect.try({
  try: () => JSON.parse(text),
  catch: cause => new HttpClientError.ResponseError({
    reason: "Decode",
    request: response.request,
    response,
    cause
  })
}));
const statusOrElse = response => Effect.fail(new HttpClientError.ResponseError({
  reason: "Decode",
  request: response.request,
  response
}));
const statusCodeError = response => Effect.fail(new HttpClientError.ResponseError({
  reason: "StatusCode",
  request: response.request,
  response
}));
const responseAsVoid = _response => Effect.void;
//# sourceMappingURL=HttpApiClient.js.map