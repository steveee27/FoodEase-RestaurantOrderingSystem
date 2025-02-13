import * as Context from "effect/Context";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import { pipeArguments } from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as HttpApiSchema from "./HttpApiSchema.js";
import * as HttpRouter from "./HttpRouter.js";
/**
 * @since 1.0.0
 * @category type ids
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/platform/HttpApiEndpoint");
/**
 * @since 1.0.0
 * @category guards
 */
export const isHttpApiEndpoint = u => Predicate.hasProperty(u, TypeId);
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
  addSuccess(schema, annotations) {
    schema = schema.pipe(Schema.annotations(HttpApiSchema.annotations({
      status: annotations?.status ?? HttpApiSchema.getStatusSuccess(schema)
    })));
    return makeProto({
      ...this,
      successSchema: this.successSchema === HttpApiSchema.NoContent ? schema : HttpApiSchema.UnionUnify(this.successSchema, schema)
    });
  },
  addError(schema, annotations) {
    return makeProto({
      ...this,
      errorSchema: HttpApiSchema.UnionUnify(this.errorSchema, schema.pipe(Schema.annotations(HttpApiSchema.annotations({
        status: annotations?.status ?? HttpApiSchema.getStatusError(schema)
      }))))
    });
  },
  setPayload(schema) {
    return makeProto({
      ...this,
      payloadSchema: Option.some(schema)
    });
  },
  setPath(schema) {
    return makeProto({
      ...this,
      pathSchema: Option.some(schema)
    });
  },
  setUrlParams(schema) {
    return makeProto({
      ...this,
      urlParamsSchema: Option.some(schema)
    });
  },
  setHeaders(schema) {
    return makeProto({
      ...this,
      headersSchema: Option.some(schema)
    });
  },
  prefix(prefix) {
    return makeProto({
      ...this,
      path: HttpRouter.prefixPath(this.path, prefix)
    });
  },
  middleware(middleware) {
    return makeProto({
      ...this,
      errorSchema: HttpApiSchema.UnionUnify(this.errorSchema, middleware.failure.pipe(Schema.annotations(HttpApiSchema.annotations({
        status: HttpApiSchema.getStatusError(middleware.failure)
      })))),
      middlewares: HashSet.add(this.middlewares, middleware)
    });
  },
  annotate(tag, value) {
    return makeProto({
      ...this,
      annotations: Context.add(this.annotations, tag, value)
    });
  },
  annotateContext(context) {
    return makeProto({
      ...this,
      annotations: Context.merge(this.annotations, context)
    });
  }
};
const makeProto = options => Object.assign(Object.create(Proto), options);
/**
 * @since 1.0.0
 * @category constructors
 */
export const make = method => (name, path) => makeProto({
  name,
  path,
  method,
  pathSchema: Option.none(),
  urlParamsSchema: Option.none(),
  payloadSchema: Option.none(),
  headersSchema: Option.none(),
  successSchema: HttpApiSchema.NoContent,
  errorSchema: Schema.Never,
  annotations: Context.empty(),
  middlewares: HashSet.empty()
});
/**
 * @since 1.0.0
 * @category constructors
 */
export const get = /*#__PURE__*/make("GET");
/**
 * @since 1.0.0
 * @category constructors
 */
export const post = /*#__PURE__*/make("POST");
/**
 * @since 1.0.0
 * @category constructors
 */
export const put = /*#__PURE__*/make("PUT");
/**
 * @since 1.0.0
 * @category constructors
 */
export const patch = /*#__PURE__*/make("PATCH");
/**
 * @since 1.0.0
 * @category constructors
 */
export const del = /*#__PURE__*/make("DELETE");
//# sourceMappingURL=HttpApiEndpoint.js.map