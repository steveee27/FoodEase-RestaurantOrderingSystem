/**
 * @since 1.0.0
 */
import * as Context from "effect/Context";
import { globalValue } from "effect/GlobalValue";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as HttpApi from "./HttpApi.js";
import * as HttpApiMiddleware from "./HttpApiMiddleware.js";
import * as HttpApiSchema from "./HttpApiSchema.js";
import * as HttpMethod from "./HttpMethod.js";
import * as JsonSchema from "./OpenApiJsonSchema.js";
/**
 * @since 1.0.0
 * @category annotations
 */
export class Identifier extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Identifier")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class Title extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Title")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class Version extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Version")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class Description extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Description")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class License extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/License")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class ExternalDocs extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/ExternalDocs")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class Servers extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Servers")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class Format extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Format")() {}
/**
 * @since 1.0.0
 * @category annotations
 */
export class Override extends /*#__PURE__*/Context.Tag("@effect/platform/OpenApi/Override")() {}
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
export const annotations = /*#__PURE__*/contextPartial({
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
const apiCache = /*#__PURE__*/globalValue("@effect/platform/OpenApi/apiCache", () => new WeakMap());
/**
 * @category constructors
 * @since 1.0.0
 */
export const fromApi = self => {
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