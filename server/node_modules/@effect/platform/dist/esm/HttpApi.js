/**
 * @since 1.0.0
 */
import * as Context from "effect/Context";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import { pipeArguments } from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as AST from "effect/SchemaAST";
import { HttpApiDecodeError } from "./HttpApiError.js";
import * as HttpApiSchema from "./HttpApiSchema.js";
/**
 * @since 1.0.0
 * @category type ids
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/platform/HttpApi");
/**
 * @since 1.0.0
 * @category guards
 */
export const isHttpApi = u => Predicate.hasProperty(u, TypeId);
/**
 * @since 1.0.0
 * @category tags
 */
export class Api extends /*#__PURE__*/Context.Tag("@effect/platform/HttpApi/Api")() {}
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
  add(group) {
    return makeProto({
      groups: HashMap.set(this.groups, group.identifier, group),
      errorSchema: this.errorSchema,
      annotations: this.annotations,
      middlewares: this.middlewares
    });
  },
  addError(schema, annotations) {
    return makeProto({
      groups: this.groups,
      errorSchema: HttpApiSchema.UnionUnify(this.errorSchema, schema.annotations(HttpApiSchema.annotations({
        status: annotations?.status ?? HttpApiSchema.getStatusError(schema)
      }))),
      annotations: this.annotations,
      middlewares: this.middlewares
    });
  },
  prefix(prefix) {
    return makeProto({
      groups: HashMap.map(this.groups, group => group.prefix(prefix)),
      errorSchema: this.errorSchema,
      annotations: this.annotations,
      middlewares: this.middlewares
    });
  },
  middleware(tag) {
    return makeProto({
      groups: this.groups,
      errorSchema: HttpApiSchema.UnionUnify(this.errorSchema, tag.failure.annotations(HttpApiSchema.annotations({
        status: HttpApiSchema.getStatusError(tag.failure)
      }))),
      annotations: this.annotations,
      middlewares: HashSet.add(this.middlewares, tag)
    });
  },
  annotate(tag, value) {
    return makeProto({
      groups: this.groups,
      errorSchema: this.errorSchema,
      annotations: Context.add(this.annotations, tag, value),
      middlewares: this.middlewares
    });
  },
  annotateContext(context) {
    return makeProto({
      groups: this.groups,
      errorSchema: this.errorSchema,
      annotations: Context.merge(this.annotations, context),
      middlewares: this.middlewares
    });
  }
};
const makeProto = options => {
  function HttpApi() {}
  Object.setPrototypeOf(HttpApi, Proto);
  HttpApi.groups = options.groups;
  HttpApi.errorSchema = options.errorSchema;
  HttpApi.annotations = options.annotations;
  HttpApi.middlewares = options.middlewares;
  return HttpApi;
};
/**
 * An `HttpApi` is a collection of `HttpApiEndpoint`s. You can use an `HttpApi` to
 * represent a portion of your domain.
 *
 * The endpoints can be implemented later using the `HttpApiBuilder.make` api.
 *
 * @since 1.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/makeProto({
  groups: /*#__PURE__*/HashMap.empty(),
  errorSchema: HttpApiDecodeError,
  annotations: /*#__PURE__*/Context.empty(),
  middlewares: /*#__PURE__*/HashSet.empty()
});
/**
 * Extract metadata from an `HttpApi`, which can be used to generate documentation
 * or other tooling.
 *
 * See the `OpenApi` & `HttpApiClient` modules for examples of how to use this function.
 *
 * @since 1.0.0
 * @category reflection
 */
export const reflect = (self, options) => {
  const apiErrors = extractMembers(self.errorSchema.ast, new Map(), HttpApiSchema.getStatusErrorAST);
  const groups = self.groups;
  for (const [, group] of groups) {
    const groupErrors = extractMembers(group.errorSchema.ast, apiErrors, HttpApiSchema.getStatusErrorAST);
    const groupAnnotations = Context.merge(self.annotations, group.annotations);
    options.onGroup({
      group,
      mergedAnnotations: groupAnnotations
    });
    const endpoints = group.endpoints;
    for (const [, endpoint] of endpoints) {
      const errors = extractMembers(endpoint.errorSchema.ast, groupErrors, HttpApiSchema.getStatusErrorAST);
      options.onEndpoint({
        group,
        endpoint,
        middleware: HashSet.union(group.middlewares, endpoint.middlewares),
        mergedAnnotations: Context.merge(groupAnnotations, endpoint.annotations),
        successes: extractMembers(endpoint.successSchema.ast, new Map(), HttpApiSchema.getStatusSuccessAST),
        errors
      });
    }
  }
};
// -------------------------------------------------------------------------------------
const extractMembers = (topAst, inherited, getStatus) => {
  const members = new Map(inherited);
  function process(ast) {
    if (ast._tag === "NeverKeyword") {
      return;
    }
    ast = AST.annotations(ast, {
      ...topAst.annotations,
      ...ast.annotations
    });
    const status = getStatus(ast);
    const emptyDecodeable = HttpApiSchema.getEmptyDecodeable(ast);
    const current = members.get(status) ?? Option.none();
    members.set(status, current.pipe(Option.map(current => AST.Union.make(current._tag === "Union" ? [...current.types, ast] : [current, ast])), Option.orElse(() => !emptyDecodeable && AST.encodedAST(ast)._tag === "VoidKeyword" ? Option.none() : Option.some(ast))));
  }
  if (topAst._tag === "Union") {
    for (const type of topAst.types) {
      process(type);
    }
  } else {
    process(topAst);
  }
  return members;
};
//# sourceMappingURL=HttpApi.js.map