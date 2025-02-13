"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromApi = exports.annotations = exports.Version = exports.Title = exports.Servers = exports.Override = exports.License = exports.Identifier = exports.Format = exports.ExternalDocs = exports.Description = void 0;
var Context = _interopRequireWildcard(require("effect/Context"));
var _GlobalValue = require("effect/GlobalValue");
var HashSet = _interopRequireWildcard(require("effect/HashSet"));
var Option = _interopRequireWildcard(require("effect/Option"));
var Schema = _interopRequireWildcard(require("effect/Schema"));
var AST = _interopRequireWildcard(require("effect/SchemaAST"));
var HttpApi = _interopRequireWildcard(require("./HttpApi.js"));
var HttpApiMiddleware = _interopRequireWildcard(require("./HttpApiMiddleware.js"));
var HttpApiSchema = _interopRequireWildcard(require("./HttpApiSchema.js"));
var HttpMethod = _interopRequireWildcard(require("./HttpMethod.js"));
var JsonSchema = _interopRequireWildcard(require("./OpenApiJsonSchema.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category annotations
 */
class Identifier extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Identifier")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.Identifier = Identifier;
class Title extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Title")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.Title = Title;
class Version extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Version")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.Version = Version;
class Description extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Description")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.Description = Description;
class License extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/License")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.License = License;
class ExternalDocs extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/ExternalDocs")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.ExternalDocs = ExternalDocs;
class Servers extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Servers")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.Servers = Servers;
class Format extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Format")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
exports.Format = Format;
class Override extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Override")() {}
exports.Override = Override;
const contextPartial = tags => {
  const entries = Object.entries(tags);
  return options => {
    let context = Context.empty();
    for (const [key, tag] of entries) {
      if (options[key] !== undefined) {
        context = Context.add(context, tag, options[key]);
      }
    }
    return context;
  };
};
/**
 * @since 1.0.0
 * @category annotations
 */
const annotations = exports.annotations = /*#__PURE__*/contextPartial({
  identifier: Identifier,
  title: Title,
  version: Version,
  description: Description,
  license: License,
  externalDocs: ExternalDocs,
  servers: Servers,
  format: Format,
  override: Override
});
const apiCache = /*#__PURE__*/(0, _GlobalValue.globalValue)("@effect/platform/OpenApi/apiCache", () => new WeakMap());
/**
 * @category constructors
 * @since 1.0.0
 */
const fromApi = self => {
  if (apiCache.has(self)) {
    return apiCache.get(self);
  }
  const api = self;
  const jsonSchemaDefs = {};
  const spec = {
    openapi: "3.0.3",
    info: {
      title: Context.getOrElse(api.annotations, Title, () => "Api"),
      version: Context.getOrElse(api.annotations, Version, () => "0.0.1")
    },
    paths: {},
    tags: [],
    components: {
      schemas: jsonSchemaDefs,
      securitySchemes: {}
    },
    security: []
  };
  function makeJsonSchemaOrRef(schema) {
    return JsonSchema.makeWithDefs(schema, {
      defs: jsonSchemaDefs,
      defsPath: "#/components/schemas/"
    });
  }
  function registerSecurity(name, security) {
    if (spec.components.securitySchemes[name]) {
      return;
    }
    const scheme = makeSecurityScheme(security);
    spec.components.securitySchemes[name] = scheme;
  }
  Option.map(Context.getOption(api.annotations, Description), description => {
    spec.info.description = description;
  });
  Option.map(Context.getOption(api.annotations, License), license => {
    spec.info.license = license;
  });
  Option.map(Context.getOption(api.annotations, Servers), servers => {
    spec.servers = servers;
  });
  Option.map(Context.getOption(api.annotations, Override), override => {
    Object.assign(spec, override);
  });
  HashSet.forEach(api.middlewares, middleware => {
    if (!HttpApiMiddleware.isSecurity(middleware)) {
      return;
    }
    for (const [name, security] of Object.entries(middleware.security)) {
      registerSecurity(name, security);
      spec.security.push({
        [name]: []
      });
    }
  });
  HttpApi.reflect(api, {
    onGroup({
      group
    }) {
      const tag = {
        name: Context.getOrElse(group.annotations, Title, () => group.identifier)
      };
      Option.map(Context.getOption(group.annotations, Description), description => {
        tag.description = description;
      });
      Option.map(Context.getOption(group.annotations, ExternalDocs), externalDocs => {
        tag.externalDocs = externalDocs;
      });
      Option.map(Context.getOption(group.annotations, Override), override => {
        Object.assign(tag, override);
      });
      spec.tags.push(tag);
    },
    onEndpoint({
      endpoint,
      errors,
      group,
      middleware,
      successes
    }) {
      const path = endpoint.path.replace(/:(\w+)[^/]*/g, "{$1}");
      const method = endpoint.method.toLowerCase();
      const op = {
        tags: [Context.getOrElse(group.annotations, Title, () => group.identifier)],
        operationId: Context.getOrElse(endpoint.annotations, Identifier, () => group.topLevel ? endpoint.name : `${group.identifier}.${endpoint.name}`),
        parameters: [],
        security: [],
        responses: {}
      };
      Option.map(Context.getOption(endpoint.annotations, Description), description => {
        op.description = description;
      });
      Option.map(Context.getOption(endpoint.annotations, ExternalDocs), externalDocs => {
        op.externalDocs = externalDocs;
      });
      HashSet.forEach(middleware, middleware => {
        if (!HttpApiMiddleware.isSecurity(middleware)) {
          return;
        }
        for (const [name, security] of Object.entries(middleware.security)) {
          registerSecurity(name, security);
          op.security.push({
            [name]: []
          });
        }
      });
      endpoint.payloadSchema.pipe(Option.filter(() => HttpMethod.hasBody(endpoint.method)), Option.map(schema => {
        op.requestBody = {
          content: {
            [HttpApiSchema.getMultipart(schema.ast) ? "multipart/form-data" : "application/json"]: {
              schema: makeJsonSchemaOrRef(schema)
            }
          },
          required: true
        };
      }));
      for (const [status, ast] of successes) {
        if (op.responses[status]) continue;
        op.responses[status] = {
          description: Option.getOrElse(getDescriptionOrIdentifier(ast), () => "Success")
        };
        ast.pipe(Option.filter(ast => !HttpApiSchema.getEmptyDecodeable(ast)), Option.map(ast => {
          op.responses[status].content = {
            "application/json": {
              schema: makeJsonSchemaOrRef(Schema.make(ast))
            }
          };
        }));
      }
      if (Option.isSome(endpoint.pathSchema)) {
        const schema = makeJsonSchemaOrRef(endpoint.pathSchema.value);
        if ("properties" in schema) {
          Object.entries(schema.properties).forEach(([name, jsonSchema]) => {
            op.parameters.push({
              name,
              in: "path",
              schema: jsonSchema,
              required: schema.required.includes(name)
            });
          });
        }
      }
      if (!HttpMethod.hasBody(endpoint.method) && Option.isSome(endpoint.payloadSchema)) {
        const schema = makeJsonSchemaOrRef(endpoint.payloadSchema.value);
        if ("properties" in schema) {
          Object.entries(schema.properties).forEach(([name, jsonSchema]) => {
            op.parameters.push({
              name,
              in: "query",
              schema: jsonSchema,
              required: schema.required.includes(name)
            });
          });
        }
      }
      if (Option.isSome(endpoint.headersSchema)) {
        const schema = makeJsonSchemaOrRef(endpoint.headersSchema.value);
        if ("properties" in schema) {
          Object.entries(schema.properties).forEach(([name, jsonSchema]) => {
            op.parameters.push({
              name,
              in: "header",
              schema: jsonSchema,
              required: schema.required.includes(name)
            });
          });
        }
      }
      if (Option.isSome(endpoint.urlParamsSchema)) {
        const schema = makeJsonSchemaOrRef(endpoint.urlParamsSchema.value);
        if ("properties" in schema) {
          Object.entries(schema.properties).forEach(([name, jsonSchema]) => {
            op.parameters.push({
              name,
              in: "query",
              schema: jsonSchema,
              required: schema.required.includes(name)
            });
          });
        }
      }
      for (const [status, ast] of errors) {
        if (op.responses[status]) continue;
        op.responses[status] = {
          description: Option.getOrElse(getDescriptionOrIdentifier(ast), () => "Error")
        };
        ast.pipe(Option.filter(ast => !HttpApiSchema.getEmptyDecodeable(ast)), Option.map(ast => {
          op.responses[status].content = {
            "application/json": {
              schema: makeJsonSchemaOrRef(Schema.make(ast))
            }
          };
        }));
      }
      if (!spec.paths[path]) {
        spec.paths[path] = {};
      }
      Option.map(Context.getOption(endpoint.annotations, Override), override => {
        Object.assign(op, override);
      });
      spec.paths[path][method] = op;
    }
  });
  apiCache.set(self, spec);
  return spec;
};
exports.fromApi = fromApi;
const makeSecurityScheme = security => {
  const meta = {};
  Option.map(Context.getOption(security.annotations, Description), description => {
    meta.description = description;
  });
  switch (security._tag) {
    case "Basic":
      {
        return {
          ...meta,
          type: "http",
          scheme: "basic"
        };
      }
    case "Bearer":
      {
        const format = Context.getOption(security.annotations, Format).pipe(Option.map(format => ({
          bearerFormat: format
        })), Option.getOrUndefined);
        return {
          ...meta,
          type: "http",
          scheme: "bearer",
          ...format
        };
      }
    case "ApiKey":
      {
        return {
          ...meta,
          type: "apiKey",
          name: security.key,
          in: security.in
        };
      }
  }
};
const getDescriptionOrIdentifier = ast => ast.pipe(Option.map(ast => "to" in ast ? {
  ...ast.to.annotations,
  ...ast.annotations
} : ast.annotations), Option.flatMapNullable(annotations => annotations[AST.DescriptionAnnotationId] ?? annotations[AST.IdentifierAnnotationId]));
//# sourceMappingURL=OpenApi.js.map