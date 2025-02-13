/**
 * @since 1.0.0
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { identity } from "effect/Function";
import * as Option from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as Schema from "effect/Schema";
import * as HttpApi from "./HttpApi.js";
import * as HttpApiSchema from "./HttpApiSchema.js";
import * as HttpClient from "./HttpClient.js";
import * as HttpClientError from "./HttpClientError.js";
import * as HttpClientRequest from "./HttpClientRequest.js";
import * as HttpClientResponse from "./HttpClientResponse.js";
import * as HttpMethod from "./HttpMethod.js";
/**
 * @since 1.0.0
 * @category constructors
 */
export const make = (api, options) => Effect.gen(function* () {
  const context = yield* Effect.context();
  const httpClient = (yield* HttpClient.HttpClient).pipe(options?.baseUrl === undefined ? identity : HttpClient.mapRequest(HttpClientRequest.prependUrl(options.baseUrl)), options?.transformClient === undefined ? identity : options.transformClient);
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
        return (isMultipart ? Effect.succeed(baseRequest.pipe(HttpClientRequest.bodyFormData(request.payload))) : encodePayload._tag === "Some" ? encodePayload.value(request.payload).pipe(Effect.flatMap(payload => HttpMethod.hasBody(endpoint.method) ? HttpClientRequest.bodyJson(baseRequest, payload) : Effect.succeed(HttpClientRequest.setUrlParams(baseRequest, payload))), Effect.orDie) : Effect.succeed(baseRequest)).pipe(encodeHeaders._tag === "Some" ? Effect.flatMap(httpRequest => encodeHeaders.value(request.headers).pipe(Effect.orDie, Effect.map(headers => HttpClientRequest.setHeaders(httpRequest, headers)))) : identity, encodeUrlParams._tag === "Some" ? Effect.flatMap(httpRequest => encodeUrlParams.value(request.urlParams).pipe(Effect.orDie, Effect.map(params => HttpClientRequest.appendUrlParams(httpRequest, params)))) : identity, Effect.flatMap(httpClient.execute), Effect.flatMap(HttpClientResponse.matchStatus(decodeMap)), options?.transformResponse === undefined ? identity : options.transformResponse, Effect.scoped, Effect.catchIf(ParseResult.isParseError, Effect.die), Effect.mapInputContext(input => Context.merge(context, input)));
      };
    }
  });
  return client;
});
// ----------------------------------------------------------------------------
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