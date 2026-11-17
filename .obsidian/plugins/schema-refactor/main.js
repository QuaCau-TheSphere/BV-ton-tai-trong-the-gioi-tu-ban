"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SchemaRefactorPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian8 = require("obsidian");

// src/app/schema-refactor-service.ts
var import_obsidian2 = require("obsidian");

// src/domain/hash.ts
var encoder = new TextEncoder();
async function sha256(value) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes).buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}

// src/domain/property-name.ts
function normalizePropertyNameForComparison(raw) {
  return raw.normalize("NFC").toLowerCase().normalize("NFC");
}
function validatePropertyName(raw) {
  const normalizedForComparison = normalizePropertyNameForComparison(raw);
  if (raw.length === 0) return { valid: false, normalizedForComparison, error: "Property name is required." };
  if (raw.trim() !== raw) return { valid: false, normalizedForComparison, error: "Property names cannot start or end with whitespace." };
  if (/\p{Cc}/u.test(raw)) return { valid: false, normalizedForComparison, error: "Property names cannot contain control characters." };
  if (raw === "__proto__" || raw === "constructor" || raw === "prototype") {
    return { valid: false, normalizedForComparison, error: "This property name is reserved for safety." };
  }
  return { valid: true, normalizedForComparison };
}
function validateRename(oldName, newName) {
  const oldResult = validatePropertyName(oldName);
  const newResult = validatePropertyName(newName);
  const errors = [];
  if (!oldResult.valid) errors.push(`Old property: ${oldResult.error ?? "Invalid name."}`);
  if (!newResult.valid) errors.push(`New property: ${newResult.error ?? "Invalid name."}`);
  if (oldName === newName && oldName.length > 0) errors.push("Old and new property names must differ.");
  return errors;
}

// src/doctor/rule-engine.ts
async function finding(ruleId, severity, filePath, message, options = {}) {
  const structuralPath = options.structuralPath;
  const fingerprint = await sha256(stableStringify({ ruleId, filePath, structuralPath, evidence: options.evidence }));
  return {
    id: fingerprint.slice(0, 20),
    ruleId,
    severity,
    filePath,
    message,
    confidence: options.confidence ?? "exact",
    fingerprint,
    ...structuralPath ? { structuralPath } : {},
    ...options.evidence ? { evidence: options.evidence } : {},
    ...options.suggestedAction ? { suggestedAction: options.suggestedAction } : {},
    ...options.refactorRequest ? { refactorRequest: options.refactorRequest } : {}
  };
}
async function runDoctor(inventory) {
  const findings = [];
  const properties = new Set(inventory.propertyTypes.keys());
  for (const base of inventory.bases) {
    if (base.parseError) findings.push(await finding("UNPARSEABLE_BASE", "error", base.snapshot.path, "This Base could not be parsed.", { evidence: base.parseError, suggestedAction: "open-file" }));
    for (const unknown of base.unknownShapes) findings.push(await finding("UNKNOWN_BASE_SHAPE", "warning", base.snapshot.path, "This configuration shape is not understood and was left untouched.", { structuralPath: unknown.path, evidence: unknown.evidence, suggestedAction: "manual-review" }));
    for (const reference of base.references.filter((item) => item.confidence === "exact" && !properties.has(item.propertyName))) {
      findings.push(await finding("MISSING_PROPERTY", "warning", base.snapshot.path, `Property '${reference.propertyName}' has no instances in the Vault.`, {
        structuralPath: reference.structuralPath,
        evidence: reference.evidence,
        suggestedAction: "create-refactor",
        refactorRequest: { oldName: reference.propertyName, newName: "" }
      }));
    }
    const definitions = new Set(base.formulaDefinitions);
    const allUses = new Set([...base.formulaRoots, ...Object.values(base.formulaDependencies).flat()].filter(Boolean));
    for (const name of allUses) if (!definitions.has(name)) findings.push(await finding("MISSING_FORMULA", "error", base.snapshot.path, `Formula '${name}' is referenced but not defined.`, { evidence: `formula.${name}`, suggestedAction: "open-file" }));
    const reachable = reachableFormulas(base.formulaRoots, base.formulaDependencies);
    if (base.unknownShapes.length === 0) {
      for (const name of definitions) if (!reachable.has(name)) findings.push(await finding("UNUSED_FORMULA", "info", base.snapshot.path, `Formula '${name}' is defined but not reachable from a known view or filter.`, { evidence: name, suggestedAction: "open-file" }));
    }
  }
  const names = [...properties].sort();
  const caseGroups = /* @__PURE__ */ new Map();
  for (const name of names) {
    const normalized = normalizePropertyNameForComparison(name);
    caseGroups.set(normalized, [...caseGroups.get(normalized) ?? [], name]);
  }
  for (const group of caseGroups.values()) if (group.length > 1) {
    const ordered = [...group].sort();
    const target = ordered.find((name) => name === normalizePropertyNameForComparison(name)) ?? ordered[0];
    const source = ordered.find((name) => name !== target);
    findings.push(await finding("CASE_DRIFT", "warning", "", `Properties differ only by case: ${group.join(", ")}.`, {
      evidence: group.join(", "),
      suggestedAction: "create-refactor",
      ...source && target ? { refactorRequest: { oldName: source, newName: target } } : {}
    }));
  }
  for (const [name, kinds] of inventory.propertyTypes) {
    const material = [...kinds].filter((kind) => kind !== "null");
    if (material.length > 1) findings.push(await finding("TYPE_DRIFT", "warning", "", `Property '${name}' has incompatible value types: ${material.sort().join(", ")}.`, { evidence: `${name}: ${material.sort().join(",")}`, suggestedAction: "manual-review" }));
  }
  const unique = new Map(findings.map((item) => [item.fingerprint, item]));
  return [...unique.values()].sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.filePath.localeCompare(b.filePath) || a.ruleId.localeCompare(b.ruleId));
}
function reachableFormulas(roots, dependencies) {
  const reachable = /* @__PURE__ */ new Set();
  const pending = [...roots];
  while (pending.length > 0) {
    const name = pending.pop();
    if (!name || reachable.has(name)) continue;
    reachable.add(name);
    pending.push(...dependencies[name] ?? []);
  }
  return reachable;
}
function severityRank(severity) {
  return { blocker: 0, error: 1, warning: 2, info: 3 }[severity];
}

// node_modules/yaml/browser/dist/nodes/identity.js
var ALIAS = Symbol.for("yaml.alias");
var DOC = Symbol.for("yaml.document");
var MAP = Symbol.for("yaml.map");
var PAIR = Symbol.for("yaml.pair");
var SCALAR = Symbol.for("yaml.scalar");
var SEQ = Symbol.for("yaml.seq");
var NODE_TYPE = Symbol.for("yaml.node.type");
var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
function isCollection(node) {
  if (node && typeof node === "object")
    switch (node[NODE_TYPE]) {
      case MAP:
      case SEQ:
        return true;
    }
  return false;
}
function isNode(node) {
  if (node && typeof node === "object")
    switch (node[NODE_TYPE]) {
      case ALIAS:
      case MAP:
      case SCALAR:
      case SEQ:
        return true;
    }
  return false;
}
var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;

// node_modules/yaml/browser/dist/visit.js
var BREAK = Symbol("break visit");
var SKIP = Symbol("skip children");
var REMOVE = Symbol("remove node");
function visit(node, visitor) {
  const visitor_ = initVisitor(visitor);
  if (isDocument(node)) {
    const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
    if (cd === REMOVE)
      node.contents = null;
  } else
    visit_(null, node, visitor_, Object.freeze([]));
}
visit.BREAK = BREAK;
visit.SKIP = SKIP;
visit.REMOVE = REMOVE;
function visit_(key, node, visitor, path) {
  const ctrl = callVisitor(key, node, visitor, path);
  if (isNode(ctrl) || isPair(ctrl)) {
    replaceNode(key, path, ctrl);
    return visit_(key, ctrl, visitor, path);
  }
  if (typeof ctrl !== "symbol") {
    if (isCollection(node)) {
      path = Object.freeze(path.concat(node));
      for (let i = 0; i < node.items.length; ++i) {
        const ci = visit_(i, node.items[i], visitor, path);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK)
          return BREAK;
        else if (ci === REMOVE) {
          node.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (isPair(node)) {
      path = Object.freeze(path.concat(node));
      const ck = visit_("key", node.key, visitor, path);
      if (ck === BREAK)
        return BREAK;
      else if (ck === REMOVE)
        node.key = null;
      const cv = visit_("value", node.value, visitor, path);
      if (cv === BREAK)
        return BREAK;
      else if (cv === REMOVE)
        node.value = null;
    }
  }
  return ctrl;
}
async function visitAsync(node, visitor) {
  const visitor_ = initVisitor(visitor);
  if (isDocument(node)) {
    const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
    if (cd === REMOVE)
      node.contents = null;
  } else
    await visitAsync_(null, node, visitor_, Object.freeze([]));
}
visitAsync.BREAK = BREAK;
visitAsync.SKIP = SKIP;
visitAsync.REMOVE = REMOVE;
async function visitAsync_(key, node, visitor, path) {
  const ctrl = await callVisitor(key, node, visitor, path);
  if (isNode(ctrl) || isPair(ctrl)) {
    replaceNode(key, path, ctrl);
    return visitAsync_(key, ctrl, visitor, path);
  }
  if (typeof ctrl !== "symbol") {
    if (isCollection(node)) {
      path = Object.freeze(path.concat(node));
      for (let i = 0; i < node.items.length; ++i) {
        const ci = await visitAsync_(i, node.items[i], visitor, path);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK)
          return BREAK;
        else if (ci === REMOVE) {
          node.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (isPair(node)) {
      path = Object.freeze(path.concat(node));
      const ck = await visitAsync_("key", node.key, visitor, path);
      if (ck === BREAK)
        return BREAK;
      else if (ck === REMOVE)
        node.key = null;
      const cv = await visitAsync_("value", node.value, visitor, path);
      if (cv === BREAK)
        return BREAK;
      else if (cv === REMOVE)
        node.value = null;
    }
  }
  return ctrl;
}
function initVisitor(visitor) {
  if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
    return Object.assign({
      Alias: visitor.Node,
      Map: visitor.Node,
      Scalar: visitor.Node,
      Seq: visitor.Node
    }, visitor.Value && {
      Map: visitor.Value,
      Scalar: visitor.Value,
      Seq: visitor.Value
    }, visitor.Collection && {
      Map: visitor.Collection,
      Seq: visitor.Collection
    }, visitor);
  }
  return visitor;
}
function callVisitor(key, node, visitor, path) {
  if (typeof visitor === "function")
    return visitor(key, node, path);
  if (isMap(node))
    return visitor.Map?.(key, node, path);
  if (isSeq(node))
    return visitor.Seq?.(key, node, path);
  if (isPair(node))
    return visitor.Pair?.(key, node, path);
  if (isScalar(node))
    return visitor.Scalar?.(key, node, path);
  if (isAlias(node))
    return visitor.Alias?.(key, node, path);
  return void 0;
}
function replaceNode(key, path, node) {
  const parent = path[path.length - 1];
  if (isCollection(parent)) {
    parent.items[key] = node;
  } else if (isPair(parent)) {
    if (key === "key")
      parent.key = node;
    else
      parent.value = node;
  } else if (isDocument(parent)) {
    parent.contents = node;
  } else {
    const pt = isAlias(parent) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${pt} parent`);
  }
}

// node_modules/yaml/browser/dist/doc/directives.js
var escapeChars = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
};
var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
var Directives = class _Directives {
  constructor(yaml, tags) {
    this.docStart = null;
    this.docEnd = false;
    this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
    this.tags = Object.assign({}, _Directives.defaultTags, tags);
  }
  clone() {
    const copy = new _Directives(this.yaml, this.tags);
    copy.docStart = this.docStart;
    return copy;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const res = new _Directives(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = true;
        break;
      case "1.2":
        this.atNextDocument = false;
        this.yaml = {
          explicit: _Directives.defaultYaml.explicit,
          version: "1.2"
        };
        this.tags = Object.assign({}, _Directives.defaultTags);
        break;
    }
    return res;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(line, onError) {
    if (this.atNextDocument) {
      this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
      this.tags = Object.assign({}, _Directives.defaultTags);
      this.atNextDocument = false;
    }
    const parts = line.trim().split(/[ \t]+/);
    const name = parts.shift();
    switch (name) {
      case "%TAG": {
        if (parts.length !== 2) {
          onError(0, "%TAG directive should contain exactly two parts");
          if (parts.length < 2)
            return false;
        }
        const [handle, prefix] = parts;
        this.tags[handle] = prefix;
        return true;
      }
      case "%YAML": {
        this.yaml.explicit = true;
        if (parts.length !== 1) {
          onError(0, "%YAML directive should contain exactly one part");
          return false;
        }
        const [version] = parts;
        if (version === "1.1" || version === "1.2") {
          this.yaml.version = version;
          return true;
        } else {
          const isValid = /^\d+\.\d+$/.test(version);
          onError(6, `Unsupported YAML version ${version}`, isValid);
          return false;
        }
      }
      default:
        onError(0, `Unknown directive ${name}`, true);
        return false;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(source, onError) {
    if (source === "!")
      return "!";
    if (source[0] !== "!") {
      onError(`Not a valid tag: ${source}`);
      return null;
    }
    if (source[1] === "<") {
      const verbatim = source.slice(2, -1);
      if (verbatim === "!" || verbatim === "!!") {
        onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
        return null;
      }
      if (source[source.length - 1] !== ">")
        onError("Verbatim tags must end with a >");
      return verbatim;
    }
    const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
    if (!suffix)
      onError(`The ${source} tag has no suffix`);
    const prefix = this.tags[handle];
    if (prefix) {
      try {
        return prefix + decodeURIComponent(suffix);
      } catch (error) {
        onError(String(error));
        return null;
      }
    }
    if (handle === "!")
      return source;
    onError(`Could not resolve tag: ${source}`);
    return null;
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(tag) {
    for (const [handle, prefix] of Object.entries(this.tags)) {
      if (tag.startsWith(prefix))
        return handle + escapeTagName(tag.substring(prefix.length));
    }
    return tag[0] === "!" ? tag : `!<${tag}>`;
  }
  toString(doc) {
    const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
    const tagEntries = Object.entries(this.tags);
    let tagNames;
    if (doc && tagEntries.length > 0 && isNode(doc.contents)) {
      const tags = {};
      visit(doc.contents, (_key, node) => {
        if (isNode(node) && node.tag)
          tags[node.tag] = true;
      });
      tagNames = Object.keys(tags);
    } else
      tagNames = [];
    for (const [handle, prefix] of tagEntries) {
      if (handle === "!!" && prefix === "tag:yaml.org,2002:")
        continue;
      if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
        lines.push(`%TAG ${handle} ${prefix}`);
    }
    return lines.join("\n");
  }
};
Directives.defaultYaml = { explicit: false, version: "1.2" };
Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };

// node_modules/yaml/browser/dist/doc/anchors.js
function anchorIsValid(anchor) {
  if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
    const sa = JSON.stringify(anchor);
    const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
    throw new Error(msg);
  }
  return true;
}
function anchorNames(root) {
  const anchors = /* @__PURE__ */ new Set();
  visit(root, {
    Value(_key, node) {
      if (node.anchor)
        anchors.add(node.anchor);
    }
  });
  return anchors;
}
function findNewAnchor(prefix, exclude) {
  for (let i = 1; true; ++i) {
    const name = `${prefix}${i}`;
    if (!exclude.has(name))
      return name;
  }
}
function createNodeAnchors(doc, prefix) {
  const aliasObjects = [];
  const sourceObjects = /* @__PURE__ */ new Map();
  let prevAnchors = null;
  return {
    onAnchor: (source) => {
      aliasObjects.push(source);
      prevAnchors ?? (prevAnchors = anchorNames(doc));
      const anchor = findNewAnchor(prefix, prevAnchors);
      prevAnchors.add(anchor);
      return anchor;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const source of aliasObjects) {
        const ref = sourceObjects.get(source);
        if (typeof ref === "object" && ref.anchor && (isScalar(ref.node) || isCollection(ref.node))) {
          ref.node.anchor = ref.anchor;
        } else {
          const error = new Error("Failed to resolve repeated object (this should not happen)");
          error.source = source;
          throw error;
        }
      }
    },
    sourceObjects
  };
}

// node_modules/yaml/browser/dist/doc/applyReviver.js
function applyReviver(reviver, obj, key, val) {
  if (val && typeof val === "object") {
    if (Array.isArray(val)) {
      for (let i = 0, len = val.length; i < len; ++i) {
        const v0 = val[i];
        const v1 = applyReviver(reviver, val, String(i), v0);
        if (v1 === void 0)
          delete val[i];
        else if (v1 !== v0)
          val[i] = v1;
      }
    } else if (val instanceof Map) {
      for (const k of Array.from(val.keys())) {
        const v0 = val.get(k);
        const v1 = applyReviver(reviver, val, k, v0);
        if (v1 === void 0)
          val.delete(k);
        else if (v1 !== v0)
          val.set(k, v1);
      }
    } else if (val instanceof Set) {
      for (const v0 of Array.from(val)) {
        const v1 = applyReviver(reviver, val, v0, v0);
        if (v1 === void 0)
          val.delete(v0);
        else if (v1 !== v0) {
          val.delete(v0);
          val.add(v1);
        }
      }
    } else {
      for (const [k, v0] of Object.entries(val)) {
        const v1 = applyReviver(reviver, val, k, v0);
        if (v1 === void 0)
          delete val[k];
        else if (v1 !== v0)
          val[k] = v1;
      }
    }
  }
  return reviver.call(obj, key, val);
}

// node_modules/yaml/browser/dist/nodes/toJS.js
function toJS(value, arg, ctx) {
  if (Array.isArray(value))
    return value.map((v, i) => toJS(v, String(i), ctx));
  if (value && typeof value.toJSON === "function") {
    if (!ctx || !hasAnchor(value))
      return value.toJSON(arg, ctx);
    const data = { aliasCount: 0, count: 1, res: void 0 };
    ctx.anchors.set(value, data);
    ctx.onCreate = (res2) => {
      data.res = res2;
      delete ctx.onCreate;
    };
    const res = value.toJSON(arg, ctx);
    if (ctx.onCreate)
      ctx.onCreate(res);
    return res;
  }
  if (typeof value === "bigint" && !ctx?.keep)
    return Number(value);
  return value;
}

// node_modules/yaml/browser/dist/nodes/Node.js
var NodeBase = class {
  constructor(type) {
    Object.defineProperty(this, NODE_TYPE, { value: type });
  }
  /** Create a copy of this node.  */
  clone() {
    const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /** A plain JavaScript representation of this node. */
  toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    if (!isDocument(doc))
      throw new TypeError("A document argument is required");
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc,
      keep: true,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS(this, "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
  }
};

// node_modules/yaml/browser/dist/nodes/Alias.js
var Alias = class extends NodeBase {
  constructor(source) {
    super(ALIAS);
    this.source = source;
    Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(doc, ctx) {
    if (ctx?.maxAliasCount === 0)
      throw new ReferenceError("Alias resolution is disabled");
    let nodes;
    if (ctx?.aliasResolveCache) {
      nodes = ctx.aliasResolveCache;
    } else {
      nodes = [];
      visit(doc, {
        Node: (_key, node) => {
          if (isAlias(node) || hasAnchor(node))
            nodes.push(node);
        }
      });
      if (ctx)
        ctx.aliasResolveCache = nodes;
    }
    let found = void 0;
    for (const node of nodes) {
      if (node === this)
        break;
      if (node.anchor === this.source)
        found = node;
    }
    return found;
  }
  toJSON(_arg, ctx) {
    if (!ctx)
      return { source: this.source };
    const { anchors, doc, maxAliasCount } = ctx;
    const source = this.resolve(doc, ctx);
    if (!source) {
      const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(msg);
    }
    let data = anchors.get(source);
    if (!data) {
      toJS(source, null, ctx);
      data = anchors.get(source);
    }
    if (data?.res === void 0) {
      const msg = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(msg);
    }
    if (maxAliasCount >= 0) {
      data.count += 1;
      if (data.aliasCount === 0)
        data.aliasCount = getAliasCount(doc, source, anchors);
      if (data.count * data.aliasCount > maxAliasCount) {
        const msg = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(msg);
      }
    }
    return data.res;
  }
  toString(ctx, _onComment, _onChompKeep) {
    const src = `*${this.source}`;
    if (ctx) {
      anchorIsValid(this.source);
      if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(msg);
      }
      if (ctx.implicitKey)
        return `${src} `;
    }
    return src;
  }
};
function getAliasCount(doc, node, anchors) {
  if (isAlias(node)) {
    const source = node.resolve(doc);
    const anchor = anchors && source && anchors.get(source);
    return anchor ? anchor.count * anchor.aliasCount : 0;
  } else if (isCollection(node)) {
    let count = 0;
    for (const item of node.items) {
      const c = getAliasCount(doc, item, anchors);
      if (c > count)
        count = c;
    }
    return count;
  } else if (isPair(node)) {
    const kc = getAliasCount(doc, node.key, anchors);
    const vc = getAliasCount(doc, node.value, anchors);
    return Math.max(kc, vc);
  }
  return 1;
}

// node_modules/yaml/browser/dist/nodes/Scalar.js
var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
var Scalar = class extends NodeBase {
  constructor(value) {
    super(SCALAR);
    this.value = value;
  }
  toJSON(arg, ctx) {
    return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
  }
  toString() {
    return String(this.value);
  }
};
Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
Scalar.PLAIN = "PLAIN";
Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";

// node_modules/yaml/browser/dist/doc/createNode.js
var defaultTagPrefix = "tag:yaml.org,2002:";
function findTagObject(value, tagName, tags) {
  if (tagName) {
    const match = tags.filter((t) => t.tag === tagName);
    const tagObj = match.find((t) => !t.format) ?? match[0];
    if (!tagObj)
      throw new Error(`Tag ${tagName} not found`);
    return tagObj;
  }
  return tags.find((t) => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
  if (isDocument(value))
    value = value.contents;
  if (isNode(value))
    return value;
  if (isPair(value)) {
    const map2 = ctx.schema[MAP].createNode?.(ctx.schema, null, ctx);
    map2.items.push(value);
    return map2;
  }
  if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
    value = value.valueOf();
  }
  const { aliasDuplicateObjects, onAnchor, onTagObj, schema: schema4, sourceObjects } = ctx;
  let ref = void 0;
  if (aliasDuplicateObjects && value && typeof value === "object") {
    ref = sourceObjects.get(value);
    if (ref) {
      ref.anchor ?? (ref.anchor = onAnchor(value));
      return new Alias(ref.anchor);
    } else {
      ref = { anchor: null, node: null };
      sourceObjects.set(value, ref);
    }
  }
  if (tagName?.startsWith("!!"))
    tagName = defaultTagPrefix + tagName.slice(2);
  let tagObj = findTagObject(value, tagName, schema4.tags);
  if (!tagObj) {
    if (value && typeof value.toJSON === "function") {
      value = value.toJSON();
    }
    if (!value || typeof value !== "object") {
      const node2 = new Scalar(value);
      if (ref)
        ref.node = node2;
      return node2;
    }
    tagObj = value instanceof Map ? schema4[MAP] : Symbol.iterator in Object(value) ? schema4[SEQ] : schema4[MAP];
  }
  if (onTagObj) {
    onTagObj(tagObj);
    delete ctx.onTagObj;
  }
  const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar(value);
  if (tagName)
    node.tag = tagName;
  else if (!tagObj.default)
    node.tag = tagObj.tag;
  if (ref)
    ref.node = node;
  return node;
}

// node_modules/yaml/browser/dist/nodes/Collection.js
function collectionFromPath(schema4, path, value) {
  let v = value;
  for (let i = path.length - 1; i >= 0; --i) {
    const k = path[i];
    if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
      const a = [];
      a[k] = v;
      v = a;
    } else {
      v = /* @__PURE__ */ new Map([[k, v]]);
    }
  }
  return createNode(v, void 0, {
    aliasDuplicateObjects: false,
    keepUndefined: false,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: schema4,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
var Collection = class extends NodeBase {
  constructor(type, schema4) {
    super(type);
    Object.defineProperty(this, "schema", {
      value: schema4,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(schema4) {
    const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (schema4)
      copy.schema = schema4;
    copy.items = copy.items.map((it) => isNode(it) || isPair(it) ? it.clone(schema4) : it);
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(path, value) {
    if (isEmptyPath(path))
      this.add(value);
    else {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (isCollection(node))
        node.addIn(rest, value);
      else if (node === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path) {
    const [key, ...rest] = path;
    if (rest.length === 0)
      return this.delete(key);
    const node = this.get(key, true);
    if (isCollection(node))
      return node.deleteIn(rest);
    else
      throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path, keepScalar) {
    const [key, ...rest] = path;
    const node = this.get(key, true);
    if (rest.length === 0)
      return !keepScalar && isScalar(node) ? node.value : node;
    else
      return isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
  }
  hasAllNullValues(allowScalar) {
    return this.items.every((node) => {
      if (!isPair(node))
        return false;
      const n = node.value;
      return n == null || allowScalar && isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(path) {
    const [key, ...rest] = path;
    if (rest.length === 0)
      return this.has(key);
    const node = this.get(key, true);
    return isCollection(node) ? node.hasIn(rest) : false;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path, value) {
    const [key, ...rest] = path;
    if (rest.length === 0) {
      this.set(key, value);
    } else {
      const node = this.get(key, true);
      if (isCollection(node))
        node.setIn(rest, value);
      else if (node === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
};

// node_modules/yaml/browser/dist/stringify/stringifyComment.js
var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
function indentComment(comment, indent) {
  if (/^\n+$/.test(comment))
    return comment.substring(1);
  return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;

// node_modules/yaml/browser/dist/stringify/foldFlowLines.js
var FOLD_FLOW = "flow";
var FOLD_BLOCK = "block";
var FOLD_QUOTED = "quoted";
function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
  if (!lineWidth || lineWidth < 0)
    return text;
  if (lineWidth < minContentWidth)
    minContentWidth = 0;
  const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
  if (text.length <= endStep)
    return text;
  const folds = [];
  const escapedFolds = {};
  let end = lineWidth - indent.length;
  if (typeof indentAtStart === "number") {
    if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
      folds.push(0);
    else
      end = lineWidth - indentAtStart;
  }
  let split = void 0;
  let prev = void 0;
  let overflow = false;
  let i = -1;
  let escStart = -1;
  let escEnd = -1;
  if (mode === FOLD_BLOCK) {
    i = consumeMoreIndentedLines(text, i, indent.length);
    if (i !== -1)
      end = i + endStep;
  }
  for (let ch; ch = text[i += 1]; ) {
    if (mode === FOLD_QUOTED && ch === "\\") {
      escStart = i;
      switch (text[i + 1]) {
        case "x":
          i += 3;
          break;
        case "u":
          i += 5;
          break;
        case "U":
          i += 9;
          break;
        default:
          i += 1;
      }
      escEnd = i;
    }
    if (ch === "\n") {
      if (mode === FOLD_BLOCK)
        i = consumeMoreIndentedLines(text, i, indent.length);
      end = i + indent.length + endStep;
      split = void 0;
    } else {
      if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
        const next = text[i + 1];
        if (next && next !== " " && next !== "\n" && next !== "	")
          split = i;
      }
      if (i >= end) {
        if (split) {
          folds.push(split);
          end = split + endStep;
          split = void 0;
        } else if (mode === FOLD_QUOTED) {
          while (prev === " " || prev === "	") {
            prev = ch;
            ch = text[i += 1];
            overflow = true;
          }
          const j = i > escEnd + 1 ? i - 2 : escStart - 1;
          if (escapedFolds[j])
            return text;
          folds.push(j);
          escapedFolds[j] = true;
          end = j + endStep;
          split = void 0;
        } else {
          overflow = true;
        }
      }
    }
    prev = ch;
  }
  if (overflow && onOverflow)
    onOverflow();
  if (folds.length === 0)
    return text;
  if (onFold)
    onFold();
  let res = text.slice(0, folds[0]);
  for (let i2 = 0; i2 < folds.length; ++i2) {
    const fold = folds[i2];
    const end2 = folds[i2 + 1] || text.length;
    if (fold === 0)
      res = `
${indent}${text.slice(0, end2)}`;
    else {
      if (mode === FOLD_QUOTED && escapedFolds[fold])
        res += `${text[fold]}\\`;
      res += `
${indent}${text.slice(fold + 1, end2)}`;
    }
  }
  return res;
}
function consumeMoreIndentedLines(text, i, indent) {
  let end = i;
  let start = i + 1;
  let ch = text[start];
  while (ch === " " || ch === "	") {
    if (i < start + indent) {
      ch = text[++i];
    } else {
      do {
        ch = text[++i];
      } while (ch && ch !== "\n");
      end = i;
      start = i + 1;
      ch = text[start];
    }
  }
  return end;
}

// node_modules/yaml/browser/dist/stringify/stringifyString.js
var getFoldOptions = (ctx, isBlock2) => ({
  indentAtStart: isBlock2 ? ctx.indent.length : ctx.indentAtStart,
  lineWidth: ctx.options.lineWidth,
  minContentWidth: ctx.options.minContentWidth
});
var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
  if (!lineWidth || lineWidth < 0)
    return false;
  const limit = lineWidth - indentLength;
  const strLen = str.length;
  if (strLen <= limit)
    return false;
  for (let i = 0, start = 0; i < strLen; ++i) {
    if (str[i] === "\n") {
      if (i - start > limit)
        return true;
      start = i + 1;
      if (strLen - start <= limit)
        return false;
    }
  }
  return true;
}
function doubleQuotedString(value, ctx) {
  const json = JSON.stringify(value);
  if (ctx.options.doubleQuotedAsJSON)
    return json;
  const { implicitKey } = ctx;
  const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  let str = "";
  let start = 0;
  for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
    if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
      str += json.slice(start, i) + "\\ ";
      i += 1;
      start = i;
      ch = "\\";
    }
    if (ch === "\\")
      switch (json[i + 1]) {
        case "u":
          {
            str += json.slice(start, i);
            const code = json.substr(i + 2, 4);
            switch (code) {
              case "0000":
                str += "\\0";
                break;
              case "0007":
                str += "\\a";
                break;
              case "000b":
                str += "\\v";
                break;
              case "001b":
                str += "\\e";
                break;
              case "0085":
                str += "\\N";
                break;
              case "00a0":
                str += "\\_";
                break;
              case "2028":
                str += "\\L";
                break;
              case "2029":
                str += "\\P";
                break;
              default:
                if (code.substr(0, 2) === "00")
                  str += "\\x" + code.substr(2);
                else
                  str += json.substr(i, 6);
            }
            i += 5;
            start = i + 1;
          }
          break;
        case "n":
          if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
            i += 1;
          } else {
            str += json.slice(start, i) + "\n\n";
            while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
              str += "\n";
              i += 2;
            }
            str += indent;
            if (json[i + 2] === " ")
              str += "\\";
            i += 1;
            start = i + 1;
          }
          break;
        default:
          i += 1;
      }
  }
  str = start ? str + json.slice(start) : json;
  return implicitKey ? str : foldFlowLines(str, indent, FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
  if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
    return doubleQuotedString(value, ctx);
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
  return ctx.implicitKey ? res : foldFlowLines(res, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
  const { singleQuote } = ctx.options;
  let qs;
  if (singleQuote === false)
    qs = doubleQuotedString;
  else {
    const hasDouble = value.includes('"');
    const hasSingle = value.includes("'");
    if (hasDouble && !hasSingle)
      qs = singleQuotedString;
    else if (hasSingle && !hasDouble)
      qs = doubleQuotedString;
    else
      qs = singleQuote ? singleQuotedString : doubleQuotedString;
  }
  return qs(value, ctx);
}
var blockEndNewlines;
try {
  blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
} catch {
  blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
  const { blockQuote, commentString, lineWidth } = ctx.options;
  if (!blockQuote || /\n[\t ]+$/.test(value)) {
    return quotedString(value, ctx);
  }
  const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
  const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.BLOCK_FOLDED ? false : type === Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
  if (!value)
    return literal ? "|\n" : ">\n";
  let chomp;
  let endStart;
  for (endStart = value.length; endStart > 0; --endStart) {
    const ch = value[endStart - 1];
    if (ch !== "\n" && ch !== "	" && ch !== " ")
      break;
  }
  let end = value.substring(endStart);
  const endNlPos = end.indexOf("\n");
  if (endNlPos === -1) {
    chomp = "-";
  } else if (value === end || endNlPos !== end.length - 1) {
    chomp = "+";
    if (onChompKeep)
      onChompKeep();
  } else {
    chomp = "";
  }
  if (end) {
    value = value.slice(0, -end.length);
    if (end[end.length - 1] === "\n")
      end = end.slice(0, -1);
    end = end.replace(blockEndNewlines, `$&${indent}`);
  }
  let startWithSpace = false;
  let startEnd;
  let startNlPos = -1;
  for (startEnd = 0; startEnd < value.length; ++startEnd) {
    const ch = value[startEnd];
    if (ch === " ")
      startWithSpace = true;
    else if (ch === "\n")
      startNlPos = startEnd;
    else
      break;
  }
  let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
  if (start) {
    value = value.substring(start.length);
    start = start.replace(/\n+/g, `$&${indent}`);
  }
  const indentSize = indent ? "2" : "1";
  let header = (startWithSpace ? indentSize : "") + chomp;
  if (comment) {
    header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
    if (onComment)
      onComment();
  }
  if (!literal) {
    const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
    let literalFallback = false;
    const foldOptions = getFoldOptions(ctx, true);
    if (blockQuote !== "folded" && type !== Scalar.BLOCK_FOLDED) {
      foldOptions.onOverflow = () => {
        literalFallback = true;
      };
    }
    const body = foldFlowLines(`${start}${foldedValue}${end}`, indent, FOLD_BLOCK, foldOptions);
    if (!literalFallback)
      return `>${header}
${indent}${body}`;
  }
  value = value.replace(/\n+/g, `$&${indent}`);
  return `|${header}
${indent}${start}${value}${end}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
  const { type, value } = item;
  const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
  if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
    return quotedString(value, ctx);
  }
  if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
    return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
  }
  if (!implicitKey && !inFlow && type !== Scalar.PLAIN && value.includes("\n")) {
    return blockString(item, ctx, onComment, onChompKeep);
  }
  if (containsDocumentMarker(value)) {
    if (indent === "") {
      ctx.forceBlockIndent = true;
      return blockString(item, ctx, onComment, onChompKeep);
    } else if (implicitKey && indent === indentStep) {
      return quotedString(value, ctx);
    }
  }
  const str = value.replace(/\n+/g, `$&
${indent}`);
  if (actualString) {
    const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
    const { compat, tags } = ctx.doc.schema;
    if (tags.some(test) || compat?.some(test))
      return quotedString(value, ctx);
  }
  return implicitKey ? str : foldFlowLines(str, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
  const { implicitKey, inFlow } = ctx;
  const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
  let { type } = item;
  if (type !== Scalar.QUOTE_DOUBLE) {
    if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
      type = Scalar.QUOTE_DOUBLE;
  }
  const _stringify = (_type) => {
    switch (_type) {
      case Scalar.BLOCK_FOLDED:
      case Scalar.BLOCK_LITERAL:
        return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
      case Scalar.QUOTE_DOUBLE:
        return doubleQuotedString(ss.value, ctx);
      case Scalar.QUOTE_SINGLE:
        return singleQuotedString(ss.value, ctx);
      case Scalar.PLAIN:
        return plainString(ss, ctx, onComment, onChompKeep);
      default:
        return null;
    }
  };
  let res = _stringify(type);
  if (res === null) {
    const { defaultKeyType, defaultStringType } = ctx.options;
    const t = implicitKey && defaultKeyType || defaultStringType;
    res = _stringify(t);
    if (res === null)
      throw new Error(`Unsupported default string type ${t}`);
  }
  return res;
}

// node_modules/yaml/browser/dist/stringify/stringify.js
function createStringifyContext(doc, options) {
  const opt = Object.assign({
    blockQuote: true,
    commentString: stringifyComment,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: false,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: true,
    indentSeq: true,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: false,
    singleQuote: null,
    trailingComma: false,
    trueStr: "true",
    verifyAliasOrder: true
  }, doc.schema.toStringOptions, options);
  let inFlow;
  switch (opt.collectionStyle) {
    case "block":
      inFlow = false;
      break;
    case "flow":
      inFlow = true;
      break;
    default:
      inFlow = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc,
    flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
    inFlow,
    options: opt
  };
}
function getTagObject(tags, item) {
  if (item.tag) {
    const match = tags.filter((t) => t.tag === item.tag);
    if (match.length > 0)
      return match.find((t) => t.format === item.format) ?? match[0];
  }
  let tagObj = void 0;
  let obj;
  if (isScalar(item)) {
    obj = item.value;
    let match = tags.filter((t) => t.identify?.(obj));
    if (match.length > 1) {
      const testMatch = match.filter((t) => t.test);
      if (testMatch.length > 0)
        match = testMatch;
    }
    tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
  } else {
    obj = item;
    tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
  }
  if (!tagObj) {
    const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
    throw new Error(`Tag not resolved for ${name} value`);
  }
  return tagObj;
}
function stringifyProps(node, tagObj, { anchors, doc }) {
  if (!doc.directives)
    return "";
  const props = [];
  const anchor = (isScalar(node) || isCollection(node)) && node.anchor;
  if (anchor && anchorIsValid(anchor)) {
    anchors.add(anchor);
    props.push(`&${anchor}`);
  }
  const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
  if (tag)
    props.push(doc.directives.tagString(tag));
  return props.join(" ");
}
function stringify(item, ctx, onComment, onChompKeep) {
  if (isPair(item))
    return item.toString(ctx, onComment, onChompKeep);
  if (isAlias(item)) {
    if (ctx.doc.directives)
      return item.toString(ctx);
    if (ctx.resolvedAliases?.has(item)) {
      throw new TypeError(`Cannot stringify circular structure without alias nodes`);
    } else {
      if (ctx.resolvedAliases)
        ctx.resolvedAliases.add(item);
      else
        ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
      item = item.resolve(ctx.doc);
    }
  }
  let tagObj = void 0;
  const node = isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
  tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
  const props = stringifyProps(node, tagObj, ctx);
  if (props.length > 0)
    ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
  const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : isScalar(node) ? stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
  if (!props)
    return str;
  return isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
}

// node_modules/yaml/browser/dist/stringify/stringifyPair.js
function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
  const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
  let keyComment = isNode(key) && key.comment || null;
  if (simpleKeys) {
    if (keyComment) {
      throw new Error("With simple keys, key nodes cannot have comments");
    }
    if (isCollection(key) || !isNode(key) && typeof key === "object") {
      const msg = "With simple keys, collection cannot be used as a key value";
      throw new Error(msg);
    }
  }
  let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || isCollection(key) || (isScalar(key) ? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL : typeof key === "object"));
  ctx = Object.assign({}, ctx, {
    allNullValues: false,
    implicitKey: !explicitKey && (simpleKeys || !allNullValues),
    indent: indent + indentStep
  });
  let keyCommentDone = false;
  let chompKeep = false;
  let str = stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
  if (!explicitKey && !ctx.inFlow && str.length > 1024) {
    if (simpleKeys)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    explicitKey = true;
  }
  if (ctx.inFlow) {
    if (allNullValues || value == null) {
      if (keyCommentDone && onComment)
        onComment();
      return str === "" ? "?" : explicitKey ? `? ${str}` : str;
    }
  } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
    str = `? ${str}`;
    if (keyComment && !keyCommentDone) {
      str += lineComment(str, ctx.indent, commentString(keyComment));
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  if (keyCommentDone)
    keyComment = null;
  if (explicitKey) {
    if (keyComment)
      str += lineComment(str, ctx.indent, commentString(keyComment));
    str = `? ${str}
${indent}:`;
  } else {
    str = `${str}:`;
    if (keyComment)
      str += lineComment(str, ctx.indent, commentString(keyComment));
  }
  let vsb, vcb, valueComment;
  if (isNode(value)) {
    vsb = !!value.spaceBefore;
    vcb = value.commentBefore;
    valueComment = value.comment;
  } else {
    vsb = false;
    vcb = null;
    valueComment = null;
    if (value && typeof value === "object")
      value = doc.createNode(value);
  }
  ctx.implicitKey = false;
  if (!explicitKey && !keyComment && isScalar(value))
    ctx.indentAtStart = str.length + 1;
  chompKeep = false;
  if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && isSeq(value) && !value.flow && !value.tag && !value.anchor) {
    ctx.indent = ctx.indent.substring(2);
  }
  let valueCommentDone = false;
  const valueStr = stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
  let ws = " ";
  if (keyComment || vsb || vcb) {
    ws = vsb ? "\n" : "";
    if (vcb) {
      const cs = commentString(vcb);
      ws += `
${indentComment(cs, ctx.indent)}`;
    }
    if (valueStr === "" && !ctx.inFlow) {
      if (ws === "\n" && valueComment)
        ws = "\n\n";
    } else {
      ws += `
${ctx.indent}`;
    }
  } else if (!explicitKey && isCollection(value)) {
    const vs0 = valueStr[0];
    const nl0 = valueStr.indexOf("\n");
    const hasNewline = nl0 !== -1;
    const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
    if (hasNewline || !flow) {
      let hasPropsLine = false;
      if (hasNewline && (vs0 === "&" || vs0 === "!")) {
        let sp0 = valueStr.indexOf(" ");
        if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
          sp0 = valueStr.indexOf(" ", sp0 + 1);
        }
        if (sp0 === -1 || nl0 < sp0)
          hasPropsLine = true;
      }
      if (!hasPropsLine)
        ws = `
${ctx.indent}`;
    }
  } else if (valueStr === "" || valueStr[0] === "\n") {
    ws = "";
  }
  str += ws + valueStr;
  if (ctx.inFlow) {
    if (valueCommentDone && onComment)
      onComment();
  } else if (valueComment && !valueCommentDone) {
    str += lineComment(str, ctx.indent, commentString(valueComment));
  } else if (chompKeep && onChompKeep) {
    onChompKeep();
  }
  return str;
}

// node_modules/yaml/browser/dist/log.js
function warn(logLevel, warning) {
  if (logLevel === "debug" || logLevel === "warn") {
    console.warn(warning);
  }
}

// node_modules/yaml/browser/dist/schema/yaml-1.1/merge.js
var MERGE_KEY = "<<";
var merge = {
  identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
  default: "key",
  tag: "tag:yaml.org,2002:merge",
  test: /^<<$/,
  resolve: () => Object.assign(new Scalar(Symbol(MERGE_KEY)), {
    addToJSMap: addMergeToJSMap
  }),
  stringify: () => MERGE_KEY
};
var isMergeKey = (ctx, key) => (merge.identify(key) || isScalar(key) && (!key.type || key.type === Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
function addMergeToJSMap(ctx, map2, value) {
  const source = resolveAliasValue(ctx, value);
  if (isSeq(source))
    for (const it of source.items)
      mergeValue(ctx, map2, it);
  else if (Array.isArray(source))
    for (const it of source)
      mergeValue(ctx, map2, it);
  else
    mergeValue(ctx, map2, source);
}
function mergeValue(ctx, map2, value) {
  const source = resolveAliasValue(ctx, value);
  if (!isMap(source))
    throw new Error("Merge sources must be maps or map aliases");
  const srcMap = source.toJSON(null, ctx, Map);
  for (const [key, value2] of srcMap) {
    if (map2 instanceof Map) {
      if (!map2.has(key))
        map2.set(key, value2);
    } else if (map2 instanceof Set) {
      map2.add(key);
    } else if (!Object.prototype.hasOwnProperty.call(map2, key)) {
      Object.defineProperty(map2, key, {
        value: value2,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
  }
  return map2;
}
function resolveAliasValue(ctx, value) {
  return ctx && isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
}

// node_modules/yaml/browser/dist/nodes/addPairToJSMap.js
function addPairToJSMap(ctx, map2, { key, value }) {
  if (isNode(key) && key.addToJSMap)
    key.addToJSMap(ctx, map2, value);
  else if (isMergeKey(ctx, key))
    addMergeToJSMap(ctx, map2, value);
  else {
    const jsKey = toJS(key, "", ctx);
    if (map2 instanceof Map) {
      map2.set(jsKey, toJS(value, jsKey, ctx));
    } else if (map2 instanceof Set) {
      map2.add(jsKey);
    } else {
      const stringKey = stringifyKey(key, jsKey, ctx);
      const jsValue = toJS(value, stringKey, ctx);
      if (stringKey in map2)
        Object.defineProperty(map2, stringKey, {
          value: jsValue,
          writable: true,
          enumerable: true,
          configurable: true
        });
      else
        map2[stringKey] = jsValue;
    }
  }
  return map2;
}
function stringifyKey(key, jsKey, ctx) {
  if (jsKey === null)
    return "";
  if (typeof jsKey !== "object")
    return String(jsKey);
  if (isNode(key) && ctx?.doc) {
    const strCtx = createStringifyContext(ctx.doc, {});
    strCtx.anchors = /* @__PURE__ */ new Set();
    for (const node of ctx.anchors.keys())
      strCtx.anchors.add(node.anchor);
    strCtx.inFlow = true;
    strCtx.inStringifyKey = true;
    const strKey = key.toString(strCtx);
    if (!ctx.mapKeyWarned) {
      let jsonStr = JSON.stringify(strKey);
      if (jsonStr.length > 40)
        jsonStr = jsonStr.substring(0, 36) + '..."';
      warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
      ctx.mapKeyWarned = true;
    }
    return strKey;
  }
  return JSON.stringify(jsKey);
}

// node_modules/yaml/browser/dist/nodes/Pair.js
function createPair(key, value, ctx) {
  const k = createNode(key, void 0, ctx);
  const v = createNode(value, void 0, ctx);
  return new Pair(k, v);
}
var Pair = class _Pair {
  constructor(key, value = null) {
    Object.defineProperty(this, NODE_TYPE, { value: PAIR });
    this.key = key;
    this.value = value;
  }
  clone(schema4) {
    let { key, value } = this;
    if (isNode(key))
      key = key.clone(schema4);
    if (isNode(value))
      value = value.clone(schema4);
    return new _Pair(key, value);
  }
  toJSON(_, ctx) {
    const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
    return addPairToJSMap(ctx, pair, this);
  }
  toString(ctx, onComment, onChompKeep) {
    return ctx?.doc ? stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
  }
};

// node_modules/yaml/browser/dist/stringify/stringifyCollection.js
function stringifyCollection(collection, ctx, options) {
  const flow = ctx.inFlow ?? collection.flow;
  const stringify4 = flow ? stringifyFlowCollection : stringifyBlockCollection;
  return stringify4(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
  const { indent, options: { commentString } } = ctx;
  const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
  let chompKeep = false;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment2 = null;
    if (isNode(item)) {
      if (!chompKeep && item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
      if (item.comment)
        comment2 = item.comment;
    } else if (isPair(item)) {
      const ik = isNode(item.key) ? item.key : null;
      if (ik) {
        if (!chompKeep && ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
      }
    }
    chompKeep = false;
    let str2 = stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
    if (comment2)
      str2 += lineComment(str2, itemIndent, commentString(comment2));
    if (chompKeep && comment2)
      chompKeep = false;
    lines.push(blockItemPrefix + str2);
  }
  let str;
  if (lines.length === 0) {
    str = flowChars.start + flowChars.end;
  } else {
    str = lines[0];
    for (let i = 1; i < lines.length; ++i) {
      const line = lines[i];
      str += line ? `
${indent}${line}` : "\n";
    }
  }
  if (comment) {
    str += "\n" + indentComment(commentString(comment), indent);
    if (onComment)
      onComment();
  } else if (chompKeep && onChompKeep)
    onChompKeep();
  return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
  const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
  itemIndent += indentStep;
  const itemCtx = Object.assign({}, ctx, {
    indent: itemIndent,
    inFlow: true,
    type: null
  });
  let reqNewline = false;
  let linesAtValue = 0;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment = null;
    if (isNode(item)) {
      if (item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, false);
      if (item.comment)
        comment = item.comment;
    } else if (isPair(item)) {
      const ik = isNode(item.key) ? item.key : null;
      if (ik) {
        if (ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, false);
        if (ik.comment)
          reqNewline = true;
      }
      const iv = isNode(item.value) ? item.value : null;
      if (iv) {
        if (iv.comment)
          comment = iv.comment;
        if (iv.commentBefore)
          reqNewline = true;
      } else if (item.value == null && ik?.comment) {
        comment = ik.comment;
      }
    }
    if (comment)
      reqNewline = true;
    let str = stringify(item, itemCtx, () => comment = null);
    reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
    if (i < items.length - 1) {
      str += ",";
    } else if (ctx.options.trailingComma) {
      if (ctx.options.lineWidth > 0) {
        reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
      }
      if (reqNewline) {
        str += ",";
      }
    }
    if (comment)
      str += lineComment(str, itemIndent, commentString(comment));
    lines.push(str);
    linesAtValue = lines.length;
  }
  const { start, end } = flowChars;
  if (lines.length === 0) {
    return start + end;
  } else {
    if (!reqNewline) {
      const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
      reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
    }
    if (reqNewline) {
      let str = start;
      for (const line of lines)
        str += line ? `
${indentStep}${indent}${line}` : "\n";
      return `${str}
${indent}${end}`;
    } else {
      return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
    }
  }
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
  if (comment && chompKeep)
    comment = comment.replace(/^\n+/, "");
  if (comment) {
    const ic = indentComment(commentString(comment), indent);
    lines.push(ic.trimStart());
  }
}

// node_modules/yaml/browser/dist/nodes/YAMLMap.js
function findPair(items, key) {
  const k = isScalar(key) ? key.value : key;
  for (const it of items) {
    if (isPair(it)) {
      if (it.key === key || it.key === k)
        return it;
      if (isScalar(it.key) && it.key.value === k)
        return it;
    }
  }
  return void 0;
}
var YAMLMap = class extends Collection {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(schema4) {
    super(MAP, schema4);
    this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(schema4, obj, ctx) {
    const { keepUndefined, replacer } = ctx;
    const map2 = new this(schema4);
    const add = (key, value) => {
      if (typeof replacer === "function")
        value = replacer.call(obj, key, value);
      else if (Array.isArray(replacer) && !replacer.includes(key))
        return;
      if (value !== void 0 || keepUndefined)
        map2.items.push(createPair(key, value, ctx));
    };
    if (obj instanceof Map) {
      for (const [key, value] of obj)
        add(key, value);
    } else if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj))
        add(key, obj[key]);
    }
    if (typeof schema4.sortMapEntries === "function") {
      map2.items.sort(schema4.sortMapEntries);
    }
    return map2;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(pair, overwrite) {
    let _pair;
    if (isPair(pair))
      _pair = pair;
    else if (!pair || typeof pair !== "object" || !("key" in pair)) {
      _pair = new Pair(pair, pair?.value);
    } else
      _pair = new Pair(pair.key, pair.value);
    const prev = findPair(this.items, _pair.key);
    const sortEntries = this.schema?.sortMapEntries;
    if (prev) {
      if (!overwrite)
        throw new Error(`Key ${_pair.key} already set`);
      if (isScalar(prev.value) && isScalarValue(_pair.value))
        prev.value.value = _pair.value;
      else
        prev.value = _pair.value;
    } else if (sortEntries) {
      const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
      if (i === -1)
        this.items.push(_pair);
      else
        this.items.splice(i, 0, _pair);
    } else {
      this.items.push(_pair);
    }
  }
  delete(key) {
    const it = findPair(this.items, key);
    if (!it)
      return false;
    const del = this.items.splice(this.items.indexOf(it), 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const it = findPair(this.items, key);
    const node = it?.value;
    return (!keepScalar && isScalar(node) ? node.value : node) ?? void 0;
  }
  has(key) {
    return !!findPair(this.items, key);
  }
  set(key, value) {
    this.add(new Pair(key, value), true);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(_, ctx, Type) {
    const map2 = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
    if (ctx?.onCreate)
      ctx.onCreate(map2);
    for (const item of this.items)
      addPairToJSMap(ctx, map2, item);
    return map2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    for (const item of this.items) {
      if (!isPair(item))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
    }
    if (!ctx.allNullValues && this.hasAllNullValues(false))
      ctx = Object.assign({}, ctx, { allNullValues: true });
    return stringifyCollection(this, ctx, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: ctx.indent || "",
      onChompKeep,
      onComment
    });
  }
};

// node_modules/yaml/browser/dist/schema/common/map.js
var map = {
  collection: "map",
  default: true,
  nodeClass: YAMLMap,
  tag: "tag:yaml.org,2002:map",
  resolve(map2, onError) {
    if (!isMap(map2))
      onError("Expected a mapping for this tag");
    return map2;
  },
  createNode: (schema4, obj, ctx) => YAMLMap.from(schema4, obj, ctx)
};

// node_modules/yaml/browser/dist/nodes/YAMLSeq.js
var YAMLSeq = class extends Collection {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(schema4) {
    super(SEQ, schema4);
    this.items = [];
  }
  add(value) {
    this.items.push(value);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return false;
    const del = this.items.splice(idx, 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return void 0;
    const it = this.items[idx];
    return !keepScalar && isScalar(it) ? it.value : it;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(key) {
    const idx = asItemIndex(key);
    return typeof idx === "number" && idx < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(key, value) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      throw new Error(`Expected a valid index, not ${key}.`);
    const prev = this.items[idx];
    if (isScalar(prev) && isScalarValue(value))
      prev.value = value;
    else
      this.items[idx] = value;
  }
  toJSON(_, ctx) {
    const seq2 = [];
    if (ctx?.onCreate)
      ctx.onCreate(seq2);
    let i = 0;
    for (const item of this.items)
      seq2.push(toJS(item, String(i++), ctx));
    return seq2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    return stringifyCollection(this, ctx, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (ctx.indent || "") + "  ",
      onChompKeep,
      onComment
    });
  }
  static from(schema4, obj, ctx) {
    const { replacer } = ctx;
    const seq2 = new this(schema4);
    if (obj && Symbol.iterator in Object(obj)) {
      let i = 0;
      for (let it of obj) {
        if (typeof replacer === "function") {
          const key = obj instanceof Set ? it : String(i++);
          it = replacer.call(obj, key, it);
        }
        seq2.items.push(createNode(it, void 0, ctx));
      }
    }
    return seq2;
  }
};
function asItemIndex(key) {
  let idx = isScalar(key) ? key.value : key;
  if (idx && typeof idx === "string")
    idx = Number(idx);
  return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
}

// node_modules/yaml/browser/dist/schema/common/seq.js
var seq = {
  collection: "seq",
  default: true,
  nodeClass: YAMLSeq,
  tag: "tag:yaml.org,2002:seq",
  resolve(seq2, onError) {
    if (!isSeq(seq2))
      onError("Expected a sequence for this tag");
    return seq2;
  },
  createNode: (schema4, obj, ctx) => YAMLSeq.from(schema4, obj, ctx)
};

// node_modules/yaml/browser/dist/schema/common/string.js
var string = {
  identify: (value) => typeof value === "string",
  default: true,
  tag: "tag:yaml.org,2002:str",
  resolve: (str) => str,
  stringify(item, ctx, onComment, onChompKeep) {
    ctx = Object.assign({ actualString: true }, ctx);
    return stringifyString(item, ctx, onComment, onChompKeep);
  }
};

// node_modules/yaml/browser/dist/schema/common/null.js
var nullTag = {
  identify: (value) => value == null,
  createNode: () => new Scalar(null),
  default: true,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new Scalar(null),
  stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
};

// node_modules/yaml/browser/dist/schema/core/bool.js
var boolTag = {
  identify: (value) => typeof value === "boolean",
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (str) => new Scalar(str[0] === "t" || str[0] === "T"),
  stringify({ source, value }, ctx) {
    if (source && boolTag.test.test(source)) {
      const sv = source[0] === "t" || source[0] === "T";
      if (value === sv)
        return source;
    }
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
};

// node_modules/yaml/browser/dist/stringify/stringifyNumber.js
function stringifyNumber({ format, minFractionDigits, tag, value }) {
  if (typeof value === "bigint")
    return String(value);
  const num = typeof value === "number" ? value : Number(value);
  if (!isFinite(num))
    return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
  let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
  if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
    let i = n.indexOf(".");
    if (i < 0) {
      i = n.length;
      n += ".";
    }
    let d = minFractionDigits - (n.length - i - 1);
    while (d-- > 0)
      n += "0";
  }
  return n;
}

// node_modules/yaml/browser/dist/schema/core/float.js
var floatNaN = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber
};
var floatExp = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str),
  stringify(node) {
    const num = Number(node.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber(node);
  }
};
var float = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(str) {
    const node = new Scalar(parseFloat(str));
    const dot = str.indexOf(".");
    if (dot !== -1 && str[str.length - 1] === "0")
      node.minFractionDigits = str.length - dot - 1;
    return node;
  },
  stringify: stringifyNumber
};

// node_modules/yaml/browser/dist/schema/core/int.js
var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
function intStringify(node, radix, prefix) {
  const { value } = node;
  if (intIdentify(value) && value >= 0)
    return prefix + value.toString(radix);
  return stringifyNumber(node);
}
var intOct = {
  identify: (value) => intIdentify(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
  stringify: (node) => intStringify(node, 8, "0o")
};
var int = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
  stringify: stringifyNumber
};
var intHex = {
  identify: (value) => intIdentify(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
  stringify: (node) => intStringify(node, 16, "0x")
};

// node_modules/yaml/browser/dist/schema/core/schema.js
var schema = [
  map,
  seq,
  string,
  nullTag,
  boolTag,
  intOct,
  int,
  intHex,
  floatNaN,
  floatExp,
  float
];

// node_modules/yaml/browser/dist/schema/json/schema.js
function intIdentify2(value) {
  return typeof value === "bigint" || Number.isInteger(value);
}
var stringifyJSON = ({ value }) => JSON.stringify(value);
var jsonScalars = [
  {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify: stringifyJSON
  },
  {
    identify: (value) => value == null,
    createNode: () => new Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: stringifyJSON
  },
  {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^true$|^false$/,
    resolve: (str) => str === "true",
    stringify: stringifyJSON
  },
  {
    identify: intIdentify2,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
    stringify: ({ value }) => intIdentify2(value) ? value.toString() : JSON.stringify(value)
  },
  {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (str) => parseFloat(str),
    stringify: stringifyJSON
  }
];
var jsonError = {
  default: true,
  tag: "",
  test: /^/,
  resolve(str, onError) {
    onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
    return str;
  }
};
var schema2 = [map, seq].concat(jsonScalars, jsonError);

// node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js
var binary = {
  identify: (value) => value instanceof Uint8Array,
  // Buffer inherits from Uint8Array
  default: false,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(src, onError) {
    if (typeof atob === "function") {
      const str = atob(src.replace(/[\n\r]/g, ""));
      const buffer = new Uint8Array(str.length);
      for (let i = 0; i < str.length; ++i)
        buffer[i] = str.charCodeAt(i);
      return buffer;
    } else {
      onError("This environment does not support reading binary tags; either Buffer or atob is required");
      return src;
    }
  },
  stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
    if (!value)
      return "";
    const buf = value;
    let str;
    if (typeof btoa === "function") {
      let s = "";
      for (let i = 0; i < buf.length; ++i)
        s += String.fromCharCode(buf[i]);
      str = btoa(s);
    } else {
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    }
    type ?? (type = Scalar.BLOCK_LITERAL);
    if (type !== Scalar.QUOTE_DOUBLE) {
      const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
      const n = Math.ceil(str.length / lineWidth);
      const lines = new Array(n);
      for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
        lines[i] = str.substr(o, lineWidth);
      }
      str = lines.join(type === Scalar.BLOCK_LITERAL ? "\n" : " ");
    }
    return stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
  }
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js
function resolvePairs(seq2, onError) {
  if (isSeq(seq2)) {
    for (let i = 0; i < seq2.items.length; ++i) {
      let item = seq2.items[i];
      if (isPair(item))
        continue;
      else if (isMap(item)) {
        if (item.items.length > 1)
          onError("Each pair must have its own sequence indicator");
        const pair = item.items[0] || new Pair(new Scalar(null));
        if (item.commentBefore)
          pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
        if (item.comment) {
          const cn = pair.value ?? pair.key;
          cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
        }
        item = pair;
      }
      seq2.items[i] = isPair(item) ? item : new Pair(item);
    }
  } else
    onError("Expected a sequence for this tag");
  return seq2;
}
function createPairs(schema4, iterable, ctx) {
  const { replacer } = ctx;
  const pairs2 = new YAMLSeq(schema4);
  pairs2.tag = "tag:yaml.org,2002:pairs";
  let i = 0;
  if (iterable && Symbol.iterator in Object(iterable))
    for (let it of iterable) {
      if (typeof replacer === "function")
        it = replacer.call(iterable, String(i++), it);
      let key, value;
      if (Array.isArray(it)) {
        if (it.length === 2) {
          key = it[0];
          value = it[1];
        } else
          throw new TypeError(`Expected [key, value] tuple: ${it}`);
      } else if (it && it instanceof Object) {
        const keys = Object.keys(it);
        if (keys.length === 1) {
          key = keys[0];
          value = it[key];
        } else {
          throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
        }
      } else {
        key = it;
      }
      pairs2.items.push(createPair(key, value, ctx));
    }
  return pairs2;
}
var pairs = {
  collection: "seq",
  default: false,
  tag: "tag:yaml.org,2002:pairs",
  resolve: resolvePairs,
  createNode: createPairs
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js
var YAMLOMap = class _YAMLOMap extends YAMLSeq {
  constructor() {
    super();
    this.add = YAMLMap.prototype.add.bind(this);
    this.delete = YAMLMap.prototype.delete.bind(this);
    this.get = YAMLMap.prototype.get.bind(this);
    this.has = YAMLMap.prototype.has.bind(this);
    this.set = YAMLMap.prototype.set.bind(this);
    this.tag = _YAMLOMap.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(_, ctx) {
    if (!ctx)
      return super.toJSON(_);
    const map2 = /* @__PURE__ */ new Map();
    if (ctx?.onCreate)
      ctx.onCreate(map2);
    for (const pair of this.items) {
      let key, value;
      if (isPair(pair)) {
        key = toJS(pair.key, "", ctx);
        value = toJS(pair.value, key, ctx);
      } else {
        key = toJS(pair, "", ctx);
      }
      if (map2.has(key))
        throw new Error("Ordered maps must not include duplicate keys");
      map2.set(key, value);
    }
    return map2;
  }
  static from(schema4, iterable, ctx) {
    const pairs2 = createPairs(schema4, iterable, ctx);
    const omap2 = new this();
    omap2.items = pairs2.items;
    return omap2;
  }
};
YAMLOMap.tag = "tag:yaml.org,2002:omap";
var omap = {
  collection: "seq",
  identify: (value) => value instanceof Map,
  nodeClass: YAMLOMap,
  default: false,
  tag: "tag:yaml.org,2002:omap",
  resolve(seq2, onError) {
    const pairs2 = resolvePairs(seq2, onError);
    const seenKeys = [];
    for (const { key } of pairs2.items) {
      if (isScalar(key)) {
        if (seenKeys.includes(key.value)) {
          onError(`Ordered maps must not include duplicate keys: ${key.value}`);
        } else {
          seenKeys.push(key.value);
        }
      }
    }
    return Object.assign(new YAMLOMap(), pairs2);
  },
  createNode: (schema4, iterable, ctx) => YAMLOMap.from(schema4, iterable, ctx)
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/bool.js
function boolStringify({ value, source }, ctx) {
  const boolObj = value ? trueTag : falseTag;
  if (source && boolObj.test.test(source))
    return source;
  return value ? ctx.options.trueStr : ctx.options.falseStr;
}
var trueTag = {
  identify: (value) => value === true,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new Scalar(true),
  stringify: boolStringify
};
var falseTag = {
  identify: (value) => value === false,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
  resolve: () => new Scalar(false),
  stringify: boolStringify
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/float.js
var floatNaN2 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber
};
var floatExp2 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str.replace(/_/g, "")),
  stringify(node) {
    const num = Number(node.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber(node);
  }
};
var float2 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(str) {
    const node = new Scalar(parseFloat(str.replace(/_/g, "")));
    const dot = str.indexOf(".");
    if (dot !== -1) {
      const f = str.substring(dot + 1).replace(/_/g, "");
      if (f[f.length - 1] === "0")
        node.minFractionDigits = f.length;
    }
    return node;
  },
  stringify: stringifyNumber
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/int.js
var intIdentify3 = (value) => typeof value === "bigint" || Number.isInteger(value);
function intResolve2(str, offset, radix, { intAsBigInt }) {
  const sign = str[0];
  if (sign === "-" || sign === "+")
    offset += 1;
  str = str.substring(offset).replace(/_/g, "");
  if (intAsBigInt) {
    switch (radix) {
      case 2:
        str = `0b${str}`;
        break;
      case 8:
        str = `0o${str}`;
        break;
      case 16:
        str = `0x${str}`;
        break;
    }
    const n2 = BigInt(str);
    return sign === "-" ? BigInt(-1) * n2 : n2;
  }
  const n = parseInt(str, radix);
  return sign === "-" ? -1 * n : n;
}
function intStringify2(node, radix, prefix) {
  const { value } = node;
  if (intIdentify3(value)) {
    const str = value.toString(radix);
    return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
  }
  return stringifyNumber(node);
}
var intBin = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (str, _onError, opt) => intResolve2(str, 2, 2, opt),
  stringify: (node) => intStringify2(node, 2, "0b")
};
var intOct2 = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (str, _onError, opt) => intResolve2(str, 1, 8, opt),
  stringify: (node) => intStringify2(node, 8, "0")
};
var int2 = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (str, _onError, opt) => intResolve2(str, 0, 10, opt),
  stringify: stringifyNumber
};
var intHex2 = {
  identify: intIdentify3,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (str, _onError, opt) => intResolve2(str, 2, 16, opt),
  stringify: (node) => intStringify2(node, 16, "0x")
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/set.js
var YAMLSet = class _YAMLSet extends YAMLMap {
  constructor(schema4) {
    super(schema4);
    this.tag = _YAMLSet.tag;
  }
  add(key) {
    let pair;
    if (isPair(key))
      pair = key;
    else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
      pair = new Pair(key.key, null);
    else
      pair = new Pair(key, null);
    const prev = findPair(this.items, pair.key);
    if (!prev)
      this.items.push(pair);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(key, keepPair) {
    const pair = findPair(this.items, key);
    return !keepPair && isPair(pair) ? isScalar(pair.key) ? pair.key.value : pair.key : pair;
  }
  set(key, value) {
    if (typeof value !== "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
    const prev = findPair(this.items, key);
    if (prev && !value) {
      this.items.splice(this.items.indexOf(prev), 1);
    } else if (!prev && value) {
      this.items.push(new Pair(key));
    }
  }
  toJSON(_, ctx) {
    return super.toJSON(_, ctx, Set);
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    if (this.hasAllNullValues(true))
      return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
    else
      throw new Error("Set items must all have null values");
  }
  static from(schema4, iterable, ctx) {
    const { replacer } = ctx;
    const set2 = new this(schema4);
    if (iterable && Symbol.iterator in Object(iterable))
      for (let value of iterable) {
        if (typeof replacer === "function")
          value = replacer.call(iterable, value, value);
        set2.items.push(createPair(value, null, ctx));
      }
    return set2;
  }
};
YAMLSet.tag = "tag:yaml.org,2002:set";
var set = {
  collection: "map",
  identify: (value) => value instanceof Set,
  nodeClass: YAMLSet,
  default: false,
  tag: "tag:yaml.org,2002:set",
  createNode: (schema4, iterable, ctx) => YAMLSet.from(schema4, iterable, ctx),
  resolve(map2, onError) {
    if (isMap(map2)) {
      if (map2.hasAllNullValues(true))
        return Object.assign(new YAMLSet(), map2);
      else
        onError("Set items must all have null values");
    } else
      onError("Expected a mapping for this tag");
    return map2;
  }
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js
function parseSexagesimal(str, asBigInt) {
  const sign = str[0];
  const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
  const num = (n) => asBigInt ? BigInt(n) : Number(n);
  const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
  return sign === "-" ? num(-1) * res : res;
}
function stringifySexagesimal(node) {
  let { value } = node;
  let num = (n) => n;
  if (typeof value === "bigint")
    num = (n) => BigInt(n);
  else if (isNaN(value) || !isFinite(value))
    return stringifyNumber(node);
  let sign = "";
  if (value < 0) {
    sign = "-";
    value *= num(-1);
  }
  const _60 = num(60);
  const parts = [value % _60];
  if (value < 60) {
    parts.unshift(0);
  } else {
    value = (value - parts[0]) / _60;
    parts.unshift(value % _60);
    if (value >= 60) {
      value = (value - parts[0]) / _60;
      parts.unshift(value);
    }
  }
  return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
var intTime = {
  identify: (value) => typeof value === "bigint" || Number.isInteger(value),
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
  stringify: stringifySexagesimal
};
var floatTime = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (str) => parseSexagesimal(str, false),
  stringify: stringifySexagesimal
};
var timestamp = {
  identify: (value) => value instanceof Date,
  default: true,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(str) {
    const match = str.match(timestamp.test);
    if (!match)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, year, month, day, hour, minute, second] = match.map(Number);
    const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
    let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
    const tz = match[8];
    if (tz && tz !== "Z") {
      let d = parseSexagesimal(tz, false);
      if (Math.abs(d) < 30)
        d *= 60;
      date -= 6e4 * d;
    }
    return new Date(date);
  },
  stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
};

// node_modules/yaml/browser/dist/schema/yaml-1.1/schema.js
var schema3 = [
  map,
  seq,
  string,
  nullTag,
  trueTag,
  falseTag,
  intBin,
  intOct2,
  int2,
  intHex2,
  floatNaN2,
  floatExp2,
  float2,
  binary,
  merge,
  omap,
  pairs,
  set,
  intTime,
  floatTime,
  timestamp
];

// node_modules/yaml/browser/dist/schema/tags.js
var schemas = /* @__PURE__ */ new Map([
  ["core", schema],
  ["failsafe", [map, seq, string]],
  ["json", schema2],
  ["yaml11", schema3],
  ["yaml-1.1", schema3]
]);
var tagsByName = {
  binary,
  bool: boolTag,
  float,
  floatExp,
  floatNaN,
  floatTime,
  int,
  intHex,
  intOct,
  intTime,
  map,
  merge,
  null: nullTag,
  omap,
  pairs,
  seq,
  set,
  timestamp
};
var coreKnownTags = {
  "tag:yaml.org,2002:binary": binary,
  "tag:yaml.org,2002:merge": merge,
  "tag:yaml.org,2002:omap": omap,
  "tag:yaml.org,2002:pairs": pairs,
  "tag:yaml.org,2002:set": set,
  "tag:yaml.org,2002:timestamp": timestamp
};
function getTags(customTags, schemaName, addMergeTag) {
  const schemaTags = schemas.get(schemaName);
  if (schemaTags && !customTags) {
    return addMergeTag && !schemaTags.includes(merge) ? schemaTags.concat(merge) : schemaTags.slice();
  }
  let tags = schemaTags;
  if (!tags) {
    if (Array.isArray(customTags))
      tags = [];
    else {
      const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
    }
  }
  if (Array.isArray(customTags)) {
    for (const tag of customTags)
      tags = tags.concat(tag);
  } else if (typeof customTags === "function") {
    tags = customTags(tags.slice());
  }
  if (addMergeTag)
    tags = tags.concat(merge);
  return tags.reduce((tags2, tag) => {
    const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
    if (!tagObj) {
      const tagName = JSON.stringify(tag);
      const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
    }
    if (!tags2.includes(tagObj))
      tags2.push(tagObj);
    return tags2;
  }, []);
}

// node_modules/yaml/browser/dist/schema/Schema.js
var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
var Schema = class _Schema {
  constructor({ compat, customTags, merge: merge2, resolveKnownTags, schema: schema4, sortMapEntries, toStringDefaults }) {
    this.compat = Array.isArray(compat) ? getTags(compat, "compat") : compat ? getTags(null, compat) : null;
    this.name = typeof schema4 === "string" && schema4 || "core";
    this.knownTags = resolveKnownTags ? coreKnownTags : {};
    this.tags = getTags(customTags, this.name, merge2);
    this.toStringOptions = toStringDefaults ?? null;
    Object.defineProperty(this, MAP, { value: map });
    Object.defineProperty(this, SCALAR, { value: string });
    Object.defineProperty(this, SEQ, { value: seq });
    this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
  }
  clone() {
    const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
    copy.tags = this.tags.slice();
    return copy;
  }
};

// node_modules/yaml/browser/dist/stringify/stringifyDocument.js
function stringifyDocument(doc, options) {
  const lines = [];
  let hasDirectives = options.directives === true;
  if (options.directives !== false && doc.directives) {
    const dir = doc.directives.toString(doc);
    if (dir) {
      lines.push(dir);
      hasDirectives = true;
    } else if (doc.directives.docStart)
      hasDirectives = true;
  }
  if (hasDirectives)
    lines.push("---");
  const ctx = createStringifyContext(doc, options);
  const { commentString } = ctx.options;
  if (doc.commentBefore) {
    if (lines.length !== 1)
      lines.unshift("");
    const cs = commentString(doc.commentBefore);
    lines.unshift(indentComment(cs, ""));
  }
  let chompKeep = false;
  let contentComment = null;
  if (doc.contents) {
    if (isNode(doc.contents)) {
      if (doc.contents.spaceBefore && hasDirectives)
        lines.push("");
      if (doc.contents.commentBefore) {
        const cs = commentString(doc.contents.commentBefore);
        lines.push(indentComment(cs, ""));
      }
      ctx.forceBlockIndent = !!doc.comment;
      contentComment = doc.contents.comment;
    }
    const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
    let body = stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
    if (contentComment)
      body += lineComment(body, "", commentString(contentComment));
    if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
      lines[lines.length - 1] = `--- ${body}`;
    } else
      lines.push(body);
  } else {
    lines.push(stringify(doc.contents, ctx));
  }
  if (doc.directives?.docEnd) {
    if (doc.comment) {
      const cs = commentString(doc.comment);
      if (cs.includes("\n")) {
        lines.push("...");
        lines.push(indentComment(cs, ""));
      } else {
        lines.push(`... ${cs}`);
      }
    } else {
      lines.push("...");
    }
  } else {
    let dc = doc.comment;
    if (dc && chompKeep)
      dc = dc.replace(/^\n+/, "");
    if (dc) {
      if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
        lines.push("");
      lines.push(indentComment(commentString(dc), ""));
    }
  }
  return lines.join("\n") + "\n";
}

// node_modules/yaml/browser/dist/doc/Document.js
var Document = class _Document {
  constructor(value, replacer, options) {
    this.commentBefore = null;
    this.comment = null;
    this.errors = [];
    this.warnings = [];
    Object.defineProperty(this, NODE_TYPE, { value: DOC });
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const opt = Object.assign({
      intAsBigInt: false,
      keepSourceTokens: false,
      logLevel: "warn",
      prettyErrors: true,
      strict: true,
      stringKeys: false,
      uniqueKeys: true,
      version: "1.2"
    }, options);
    this.options = opt;
    let { version } = opt;
    if (options?._directives) {
      this.directives = options._directives.atDocument();
      if (this.directives.yaml.explicit)
        version = this.directives.yaml.version;
    } else
      this.directives = new Directives({ version });
    this.setSchema(version, options);
    this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const copy = Object.create(_Document.prototype, {
      [NODE_TYPE]: { value: DOC }
    });
    copy.commentBefore = this.commentBefore;
    copy.comment = this.comment;
    copy.errors = this.errors.slice();
    copy.warnings = this.warnings.slice();
    copy.options = Object.assign({}, this.options);
    if (this.directives)
      copy.directives = this.directives.clone();
    copy.schema = this.schema.clone();
    copy.contents = isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /** Adds a value to the document. */
  add(value) {
    if (assertCollection(this.contents))
      this.contents.add(value);
  }
  /** Adds a value to the document. */
  addIn(path, value) {
    if (assertCollection(this.contents))
      this.contents.addIn(path, value);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(node, name) {
    if (!node.anchor) {
      const prev = anchorNames(this);
      node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !name || prev.has(name) ? findNewAnchor(name || "a", prev) : name;
    }
    return new Alias(node.anchor);
  }
  createNode(value, replacer, options) {
    let _replacer = void 0;
    if (typeof replacer === "function") {
      value = replacer.call({ "": value }, "", value);
      _replacer = replacer;
    } else if (Array.isArray(replacer)) {
      const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
      const asStr = replacer.filter(keyToStr).map(String);
      if (asStr.length > 0)
        replacer = replacer.concat(asStr);
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
    const { onAnchor, setAnchors, sourceObjects } = createNodeAnchors(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      anchorPrefix || "a"
    );
    const ctx = {
      aliasDuplicateObjects: aliasDuplicateObjects ?? true,
      keepUndefined: keepUndefined ?? false,
      onAnchor,
      onTagObj,
      replacer: _replacer,
      schema: this.schema,
      sourceObjects
    };
    const node = createNode(value, tag, ctx);
    if (flow && isCollection(node))
      node.flow = true;
    setAnchors();
    return node;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(key, value, options = {}) {
    const k = this.createNode(key, null, options);
    const v = this.createNode(value, null, options);
    return new Pair(k, v);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    return assertCollection(this.contents) ? this.contents.delete(key) : false;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path) {
    if (isEmptyPath(path)) {
      if (this.contents == null)
        return false;
      this.contents = null;
      return true;
    }
    return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(key, keepScalar) {
    return isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path, keepScalar) {
    if (isEmptyPath(path))
      return !keepScalar && isScalar(this.contents) ? this.contents.value : this.contents;
    return isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(key) {
    return isCollection(this.contents) ? this.contents.has(key) : false;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(path) {
    if (isEmptyPath(path))
      return this.contents !== void 0;
    return isCollection(this.contents) ? this.contents.hasIn(path) : false;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(key, value) {
    if (this.contents == null) {
      this.contents = collectionFromPath(this.schema, [key], value);
    } else if (assertCollection(this.contents)) {
      this.contents.set(key, value);
    }
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path, value) {
    if (isEmptyPath(path)) {
      this.contents = value;
    } else if (this.contents == null) {
      this.contents = collectionFromPath(this.schema, Array.from(path), value);
    } else if (assertCollection(this.contents)) {
      this.contents.setIn(path, value);
    }
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(version, options = {}) {
    if (typeof version === "number")
      version = String(version);
    let opt;
    switch (version) {
      case "1.1":
        if (this.directives)
          this.directives.yaml.version = "1.1";
        else
          this.directives = new Directives({ version: "1.1" });
        opt = { resolveKnownTags: false, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        if (this.directives)
          this.directives.yaml.version = version;
        else
          this.directives = new Directives({ version });
        opt = { resolveKnownTags: true, schema: "core" };
        break;
      case null:
        if (this.directives)
          delete this.directives;
        opt = null;
        break;
      default: {
        const sv = JSON.stringify(version);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
      }
    }
    if (options.schema instanceof Object)
      this.schema = options.schema;
    else if (opt)
      this.schema = new Schema(Object.assign(opt, options));
    else
      throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !json,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS(this.contents, jsonArg ?? "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(jsonArg, onAnchor) {
    return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
  }
  /** A YAML representation of the document. */
  toString(options = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
      const s = JSON.stringify(options.indent);
      throw new Error(`"indent" option must be a positive integer, not ${s}`);
    }
    return stringifyDocument(this, options);
  }
};
function assertCollection(contents) {
  if (isCollection(contents))
    return true;
  throw new Error("Expected a YAML collection as document contents");
}

// node_modules/yaml/browser/dist/errors.js
var YAMLError = class extends Error {
  constructor(name, pos, code, message) {
    super();
    this.name = name;
    this.code = code;
    this.message = message;
    this.pos = pos;
  }
};
var YAMLParseError = class extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLParseError", pos, code, message);
  }
};
var YAMLWarning = class extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLWarning", pos, code, message);
  }
};
var prettifyError = (src, lc) => (error) => {
  if (error.pos[0] === -1)
    return;
  error.linePos = error.pos.map((pos) => lc.linePos(pos));
  const { line, col } = error.linePos[0];
  error.message += ` at line ${line}, column ${col}`;
  let ci = col - 1;
  let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
  if (ci >= 60 && lineStr.length > 80) {
    const trimStart = Math.min(ci - 39, lineStr.length - 79);
    lineStr = "\u2026" + lineStr.substring(trimStart);
    ci -= trimStart - 1;
  }
  if (lineStr.length > 80)
    lineStr = lineStr.substring(0, 79) + "\u2026";
  if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
    let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
    if (prev.length > 80)
      prev = prev.substring(0, 79) + "\u2026\n";
    lineStr = prev + lineStr;
  }
  if (/[^ ]/.test(lineStr)) {
    let count = 1;
    const end = error.linePos[1];
    if (end?.line === line && end.col > col) {
      count = Math.max(1, Math.min(end.col - col, 80 - ci));
    }
    const pointer = " ".repeat(ci) + "^".repeat(count);
    error.message += `:

${lineStr}
${pointer}
`;
  }
};

// node_modules/yaml/browser/dist/compose/resolve-props.js
function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
  let spaceBefore = false;
  let atNewline = startOnNewline;
  let hasSpace = startOnNewline;
  let comment = "";
  let commentSep = "";
  let hasNewline = false;
  let reqSpace = false;
  let tab = null;
  let anchor = null;
  let tag = null;
  let newlineAfterProp = null;
  let comma = null;
  let found = null;
  let start = null;
  for (const token of tokens) {
    if (reqSpace) {
      if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
        onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      reqSpace = false;
    }
    if (tab) {
      if (atNewline && token.type !== "comment" && token.type !== "newline") {
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      }
      tab = null;
    }
    switch (token.type) {
      case "space":
        if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
          tab = token;
        }
        hasSpace = true;
        break;
      case "comment": {
        if (!hasSpace)
          onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const cb = token.source.substring(1) || " ";
        if (!comment)
          comment = cb;
        else
          comment += commentSep + cb;
        commentSep = "";
        atNewline = false;
        break;
      }
      case "newline":
        if (atNewline) {
          if (comment)
            comment += token.source;
          else if (!found || indicator !== "seq-item-ind")
            spaceBefore = true;
        } else
          commentSep += token.source;
        atNewline = true;
        hasNewline = true;
        if (anchor || tag)
          newlineAfterProp = token;
        hasSpace = true;
        break;
      case "anchor":
        if (anchor)
          onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
        if (token.source.endsWith(":"))
          onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
        anchor = token;
        start ?? (start = token.offset);
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      case "tag": {
        if (tag)
          onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
        tag = token;
        start ?? (start = token.offset);
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      }
      case indicator:
        if (anchor || tag)
          onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
        if (found)
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
        found = token;
        atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
        hasSpace = false;
        break;
      case "comma":
        if (flow) {
          if (comma)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
          comma = token;
          atNewline = false;
          hasSpace = false;
          break;
        }
      // else fallthrough
      default:
        onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
        atNewline = false;
        hasSpace = false;
    }
  }
  const last = tokens[tokens.length - 1];
  const end = last ? last.offset + last.source.length : offset;
  if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
    onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
  }
  if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
    onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
  return {
    comma,
    found,
    spaceBefore,
    comment,
    hasNewline,
    anchor,
    tag,
    newlineAfterProp,
    end,
    start: start ?? end
  };
}

// node_modules/yaml/browser/dist/compose/util-contains-newline.js
function containsNewline(key) {
  if (!key)
    return null;
  switch (key.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (key.source.includes("\n"))
        return true;
      if (key.end) {
        for (const st of key.end)
          if (st.type === "newline")
            return true;
      }
      return false;
    case "flow-collection":
      for (const it of key.items) {
        for (const st of it.start)
          if (st.type === "newline")
            return true;
        if (it.sep) {
          for (const st of it.sep)
            if (st.type === "newline")
              return true;
        }
        if (containsNewline(it.key) || containsNewline(it.value))
          return true;
      }
      return false;
    default:
      return true;
  }
}

// node_modules/yaml/browser/dist/compose/util-flow-indent-check.js
function flowIndentCheck(indent, fc, onError) {
  if (fc?.type === "flow-collection") {
    const end = fc.end[0];
    if (end.indent === indent && (end.source === "]" || end.source === "}") && containsNewline(fc)) {
      const msg = "Flow end indicator should be more indented than parent";
      onError(end, "BAD_INDENT", msg, true);
    }
  }
}

// node_modules/yaml/browser/dist/compose/util-map-includes.js
function mapIncludes(ctx, items, search) {
  const { uniqueKeys } = ctx.options;
  if (uniqueKeys === false)
    return false;
  const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || isScalar(a) && isScalar(b) && a.value === b.value;
  return items.some((pair) => isEqual(pair.key, search));
}

// node_modules/yaml/browser/dist/compose/resolve-block-map.js
var startColMsg = "All mapping items must start at the same column";
function resolveBlockMap({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bm, onError, tag) {
  const NodeClass = tag?.nodeClass ?? YAMLMap;
  const map2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  let offset = bm.offset;
  let commentEnd = null;
  for (const collItem of bm.items) {
    const { start, key, sep, value } = collItem;
    const keyProps = resolveProps(start, {
      indicator: "explicit-key-ind",
      next: key ?? sep?.[0],
      offset,
      onError,
      parentIndent: bm.indent,
      startOnNewline: true
    });
    const implicitKey = !keyProps.found;
    if (implicitKey) {
      if (key) {
        if (key.type === "block-seq")
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
        else if ("indent" in key && key.indent !== bm.indent)
          onError(offset, "BAD_INDENT", startColMsg);
      }
      if (!keyProps.anchor && !keyProps.tag && !sep) {
        commentEnd = keyProps.end;
        if (keyProps.comment) {
          if (map2.comment)
            map2.comment += "\n" + keyProps.comment;
          else
            map2.comment = keyProps.comment;
        }
        continue;
      }
      if (keyProps.newlineAfterProp || containsNewline(key)) {
        onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      }
    } else if (keyProps.found?.indent !== bm.indent) {
      onError(offset, "BAD_INDENT", startColMsg);
    }
    ctx.atKey = true;
    const keyStart = keyProps.end;
    const keyNode = key ? composeNode2(ctx, key, keyProps, onError) : composeEmptyNode2(ctx, keyStart, start, null, keyProps, onError);
    if (ctx.schema.compat)
      flowIndentCheck(bm.indent, key, onError);
    ctx.atKey = false;
    if (mapIncludes(ctx, map2.items, keyNode))
      onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
    const valueProps = resolveProps(sep ?? [], {
      indicator: "map-value-ind",
      next: value,
      offset: keyNode.range[2],
      onError,
      parentIndent: bm.indent,
      startOnNewline: !key || key.type === "block-scalar"
    });
    offset = valueProps.end;
    if (valueProps.found) {
      if (implicitKey) {
        if (value?.type === "block-map" && !valueProps.hasNewline)
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
        if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
          onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : composeEmptyNode2(ctx, offset, sep, null, valueProps, onError);
      if (ctx.schema.compat)
        flowIndentCheck(bm.indent, value, onError);
      offset = valueNode.range[2];
      const pair = new Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    } else {
      if (implicitKey)
        onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
      if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair(keyNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    }
  }
  if (commentEnd && commentEnd < offset)
    onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
  map2.range = [bm.offset, offset, commentEnd ?? offset];
  return map2;
}

// node_modules/yaml/browser/dist/compose/resolve-block-seq.js
function resolveBlockSeq({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bs, onError, tag) {
  const NodeClass = tag?.nodeClass ?? YAMLSeq;
  const seq2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = bs.offset;
  let commentEnd = null;
  for (const { start, value } of bs.items) {
    const props = resolveProps(start, {
      indicator: "seq-item-ind",
      next: value,
      offset,
      onError,
      parentIndent: bs.indent,
      startOnNewline: true
    });
    if (!props.found) {
      if (props.anchor || props.tag || value) {
        if (value?.type === "block-seq")
          onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
        else
          onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
      } else {
        commentEnd = props.end;
        if (props.comment)
          seq2.comment = props.comment;
        continue;
      }
    }
    const node = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, start, null, props, onError);
    if (ctx.schema.compat)
      flowIndentCheck(bs.indent, value, onError);
    offset = node.range[2];
    seq2.items.push(node);
  }
  seq2.range = [bs.offset, offset, commentEnd ?? offset];
  return seq2;
}

// node_modules/yaml/browser/dist/compose/resolve-end.js
function resolveEnd(end, offset, reqSpace, onError) {
  let comment = "";
  if (end) {
    let hasSpace = false;
    let sep = "";
    for (const token of end) {
      const { source, type } = token;
      switch (type) {
        case "space":
          hasSpace = true;
          break;
        case "comment": {
          if (reqSpace && !hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += sep + cb;
          sep = "";
          break;
        }
        case "newline":
          if (comment)
            sep += source;
          hasSpace = true;
          break;
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
      }
      offset += source.length;
    }
  }
  return { comment, offset };
}

// node_modules/yaml/browser/dist/compose/resolve-flow-collection.js
var blockMsg = "Block collections are not allowed within flow collections";
var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
function resolveFlowCollection({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, fc, onError, tag) {
  const isMap2 = fc.start.source === "{";
  const fcName = isMap2 ? "flow map" : "flow sequence";
  const NodeClass = tag?.nodeClass ?? (isMap2 ? YAMLMap : YAMLSeq);
  const coll = new NodeClass(ctx.schema);
  coll.flow = true;
  const atRoot = ctx.atRoot;
  if (atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = fc.offset + fc.start.source.length;
  for (let i = 0; i < fc.items.length; ++i) {
    const collItem = fc.items[i];
    const { start, key, sep, value } = collItem;
    const props = resolveProps(start, {
      flow: fcName,
      indicator: "explicit-key-ind",
      next: key ?? sep?.[0],
      offset,
      onError,
      parentIndent: fc.indent,
      startOnNewline: false
    });
    if (!props.found) {
      if (!props.anchor && !props.tag && !sep && !value) {
        if (i === 0 && props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        else if (i < fc.items.length - 1)
          onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
        if (props.comment) {
          if (coll.comment)
            coll.comment += "\n" + props.comment;
          else
            coll.comment = props.comment;
        }
        offset = props.end;
        continue;
      }
      if (!isMap2 && ctx.options.strict && containsNewline(key))
        onError(
          key,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
    }
    if (i === 0) {
      if (props.comma)
        onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
    } else {
      if (!props.comma)
        onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
      if (props.comment) {
        let prevItemComment = "";
        loop: for (const st of start) {
          switch (st.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              prevItemComment = st.source.substring(1);
              break loop;
            default:
              break loop;
          }
        }
        if (prevItemComment) {
          let prev = coll.items[coll.items.length - 1];
          if (isPair(prev))
            prev = prev.value ?? prev.key;
          if (prev.comment)
            prev.comment += "\n" + prevItemComment;
          else
            prev.comment = prevItemComment;
          props.comment = props.comment.substring(prevItemComment.length + 1);
        }
      }
    }
    if (!isMap2 && !sep && !props.found) {
      const valueNode = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, sep, null, props, onError);
      coll.items.push(valueNode);
      offset = valueNode.range[2];
      if (isBlock(value))
        onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
    } else {
      ctx.atKey = true;
      const keyStart = props.end;
      const keyNode = key ? composeNode2(ctx, key, props, onError) : composeEmptyNode2(ctx, keyStart, start, null, props, onError);
      if (isBlock(key))
        onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
      ctx.atKey = false;
      const valueProps = resolveProps(sep ?? [], {
        flow: fcName,
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (valueProps.found) {
        if (!isMap2 && !props.found && ctx.options.strict) {
          if (sep)
            for (const st of sep) {
              if (st === valueProps.found)
                break;
              if (st.type === "newline") {
                onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          if (props.start < valueProps.found.offset - 1024)
            onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else if (value) {
        if ("source" in value && value.source?.[0] === ":")
          onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
        else
          onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode2(ctx, valueProps.end, sep, null, valueProps, onError) : null;
      if (valueNode) {
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      if (isMap2) {
        const map2 = coll;
        if (mapIncludes(ctx, map2.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        map2.items.push(pair);
      } else {
        const map2 = new YAMLMap(ctx.schema);
        map2.flow = true;
        map2.items.push(pair);
        const endRange = (valueNode ?? keyNode).range;
        map2.range = [keyNode.range[0], endRange[1], endRange[2]];
        coll.items.push(map2);
      }
      offset = valueNode ? valueNode.range[2] : valueProps.end;
    }
  }
  const expectedEnd = isMap2 ? "}" : "]";
  const [ce, ...ee] = fc.end;
  let cePos = offset;
  if (ce?.source === expectedEnd)
    cePos = ce.offset + ce.source.length;
  else {
    const name = fcName[0].toUpperCase() + fcName.substring(1);
    const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
    onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
    if (ce && ce.source.length !== 1)
      ee.unshift(ce);
  }
  if (ee.length > 0) {
    const end = resolveEnd(ee, cePos, ctx.options.strict, onError);
    if (end.comment) {
      if (coll.comment)
        coll.comment += "\n" + end.comment;
      else
        coll.comment = end.comment;
    }
    coll.range = [fc.offset, cePos, end.offset];
  } else {
    coll.range = [fc.offset, cePos, cePos];
  }
  return coll;
}

// node_modules/yaml/browser/dist/compose/compose-collection.js
function resolveCollection(CN2, ctx, token, onError, tagName, tag) {
  const coll = token.type === "block-map" ? resolveBlockMap(CN2, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq(CN2, ctx, token, onError, tag) : resolveFlowCollection(CN2, ctx, token, onError, tag);
  const Coll = coll.constructor;
  if (tagName === "!" || tagName === Coll.tagName) {
    coll.tag = Coll.tagName;
    return coll;
  }
  if (tagName)
    coll.tag = tagName;
  return coll;
}
function composeCollection(CN2, ctx, token, props, onError) {
  const tagToken = props.tag;
  const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
  if (token.type === "block-seq") {
    const { anchor, newlineAfterProp: nl } = props;
    const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
    if (lastProp && (!nl || nl.offset < lastProp.offset)) {
      const message = "Missing newline after block sequence props";
      onError(lastProp, "MISSING_CHAR", message);
    }
  }
  const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
  if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.tagName && expType === "seq") {
    return resolveCollection(CN2, ctx, token, onError, tagName);
  }
  let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
  if (!tag) {
    const kt = ctx.schema.knownTags[tagName];
    if (kt?.collection === expType) {
      ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
      tag = kt;
    } else {
      if (kt) {
        onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
      } else {
        onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
      }
      return resolveCollection(CN2, ctx, token, onError, tagName);
    }
  }
  const coll = resolveCollection(CN2, ctx, token, onError, tagName, tag);
  const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
  const node = isNode(res) ? res : new Scalar(res);
  node.range = coll.range;
  node.tag = tagName;
  if (tag?.format)
    node.format = tag.format;
  return node;
}

// node_modules/yaml/browser/dist/compose/resolve-block-scalar.js
function resolveBlockScalar(ctx, scalar, onError) {
  const start = scalar.offset;
  const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
  if (!header)
    return { value: "", type: null, comment: "", range: [start, start, start] };
  const type = header.mode === ">" ? Scalar.BLOCK_FOLDED : Scalar.BLOCK_LITERAL;
  const lines = scalar.source ? splitLines(scalar.source) : [];
  let chompStart = lines.length;
  for (let i = lines.length - 1; i >= 0; --i) {
    const content = lines[i][1];
    if (content === "" || content === "\r")
      chompStart = i;
    else
      break;
  }
  if (chompStart === 0) {
    const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
    let end2 = start + header.length;
    if (scalar.source)
      end2 += scalar.source.length;
    return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
  }
  let trimIndent = scalar.indent + header.indent;
  let offset = scalar.offset + header.length;
  let contentStart = 0;
  for (let i = 0; i < chompStart; ++i) {
    const [indent, content] = lines[i];
    if (content === "" || content === "\r") {
      if (header.indent === 0 && indent.length > trimIndent)
        trimIndent = indent.length;
    } else {
      if (indent.length < trimIndent) {
        const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
        onError(offset + indent.length, "MISSING_CHAR", message);
      }
      if (header.indent === 0)
        trimIndent = indent.length;
      contentStart = i;
      if (trimIndent === 0 && !ctx.atRoot) {
        const message = "Block scalar values in collections must be indented";
        onError(offset, "BAD_INDENT", message);
      }
      break;
    }
    offset += indent.length + content.length + 1;
  }
  for (let i = lines.length - 1; i >= chompStart; --i) {
    if (lines[i][0].length > trimIndent)
      chompStart = i + 1;
  }
  let value = "";
  let sep = "";
  let prevMoreIndented = false;
  for (let i = 0; i < contentStart; ++i)
    value += lines[i][0].slice(trimIndent) + "\n";
  for (let i = contentStart; i < chompStart; ++i) {
    let [indent, content] = lines[i];
    offset += indent.length + content.length + 1;
    const crlf = content[content.length - 1] === "\r";
    if (crlf)
      content = content.slice(0, -1);
    if (content && indent.length < trimIndent) {
      const src = header.indent ? "explicit indentation indicator" : "first line";
      const message = `Block scalar lines must not be less indented than their ${src}`;
      onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
      indent = "";
    }
    if (type === Scalar.BLOCK_LITERAL) {
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
    } else if (indent.length > trimIndent || content[0] === "	") {
      if (sep === " ")
        sep = "\n";
      else if (!prevMoreIndented && sep === "\n")
        sep = "\n\n";
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
      prevMoreIndented = true;
    } else if (content === "") {
      if (sep === "\n")
        value += "\n";
      else
        sep = "\n";
    } else {
      value += sep + content;
      sep = " ";
      prevMoreIndented = false;
    }
  }
  switch (header.chomp) {
    case "-":
      break;
    case "+":
      for (let i = chompStart; i < lines.length; ++i)
        value += "\n" + lines[i][0].slice(trimIndent);
      if (value[value.length - 1] !== "\n")
        value += "\n";
      break;
    default:
      value += "\n";
  }
  const end = start + header.length + scalar.source.length;
  return { value, type, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
  if (props[0].type !== "block-scalar-header") {
    onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
    return null;
  }
  const { source } = props[0];
  const mode = source[0];
  let indent = 0;
  let chomp = "";
  let error = -1;
  for (let i = 1; i < source.length; ++i) {
    const ch = source[i];
    if (!chomp && (ch === "-" || ch === "+"))
      chomp = ch;
    else {
      const n = Number(ch);
      if (!indent && n)
        indent = n;
      else if (error === -1)
        error = offset + i;
    }
  }
  if (error !== -1)
    onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
  let hasSpace = false;
  let comment = "";
  let length = source.length;
  for (let i = 1; i < props.length; ++i) {
    const token = props[i];
    switch (token.type) {
      case "space":
        hasSpace = true;
      // fallthrough
      case "newline":
        length += token.source.length;
        break;
      case "comment":
        if (strict && !hasSpace) {
          const message = "Comments must be separated from other tokens by white space characters";
          onError(token, "MISSING_CHAR", message);
        }
        length += token.source.length;
        comment = token.source.substring(1);
        break;
      case "error":
        onError(token, "UNEXPECTED_TOKEN", token.message);
        length += token.source.length;
        break;
      /* istanbul ignore next should not happen */
      default: {
        const message = `Unexpected token in block scalar header: ${token.type}`;
        onError(token, "UNEXPECTED_TOKEN", message);
        const ts = token.source;
        if (ts && typeof ts === "string")
          length += ts.length;
      }
    }
  }
  return { mode, indent, chomp, comment, length };
}
function splitLines(source) {
  const split = source.split(/\n( *)/);
  const first = split[0];
  const m = first.match(/^( *)/);
  const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
  const lines = [line0];
  for (let i = 1; i < split.length; i += 2)
    lines.push([split[i], split[i + 1]]);
  return lines;
}

// node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js
function resolveFlowScalar(scalar, strict, onError) {
  const { offset, type, source, end } = scalar;
  let _type;
  let value;
  const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
  switch (type) {
    case "scalar":
      _type = Scalar.PLAIN;
      value = plainValue(source, _onError);
      break;
    case "single-quoted-scalar":
      _type = Scalar.QUOTE_SINGLE;
      value = singleQuotedValue(source, _onError);
      break;
    case "double-quoted-scalar":
      _type = Scalar.QUOTE_DOUBLE;
      value = doubleQuotedValue(source, _onError);
      break;
    /* istanbul ignore next should not happen */
    default:
      onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
      return {
        value: "",
        type: null,
        comment: "",
        range: [offset, offset + source.length, offset + source.length]
      };
  }
  const valueEnd = offset + source.length;
  const re = resolveEnd(end, valueEnd, strict, onError);
  return {
    value,
    type: _type,
    comment: re.comment,
    range: [offset, valueEnd, re.offset]
  };
}
function plainValue(source, onError) {
  let badChar = "";
  switch (source[0]) {
    /* istanbul ignore next should not happen */
    case "	":
      badChar = "a tab character";
      break;
    case ",":
      badChar = "flow indicator character ,";
      break;
    case "%":
      badChar = "directive indicator character %";
      break;
    case "|":
    case ">": {
      badChar = `block scalar indicator ${source[0]}`;
      break;
    }
    case "@":
    case "`": {
      badChar = `reserved character ${source[0]}`;
      break;
    }
  }
  if (badChar)
    onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
  return foldLines(source);
}
function singleQuotedValue(source, onError) {
  if (source[source.length - 1] !== "'" || source.length === 1)
    onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
  return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
  let first, line;
  try {
    first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
    line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
  } catch {
    first = /(.*?)[ \t]*\r?\n/sy;
    line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let match = first.exec(source);
  if (!match)
    return source;
  let res = match[1];
  let sep = " ";
  let pos = first.lastIndex;
  line.lastIndex = pos;
  while (match = line.exec(source)) {
    if (match[1] === "") {
      if (sep === "\n")
        res += sep;
      else
        sep = "\n";
    } else {
      res += sep + match[1];
      sep = " ";
    }
    pos = line.lastIndex;
  }
  const last = /[ \t]*(.*)/sy;
  last.lastIndex = pos;
  match = last.exec(source);
  return res + sep + (match?.[1] ?? "");
}
function doubleQuotedValue(source, onError) {
  let res = "";
  for (let i = 1; i < source.length - 1; ++i) {
    const ch = source[i];
    if (ch === "\r" && source[i + 1] === "\n")
      continue;
    if (ch === "\n") {
      const { fold, offset } = foldNewline(source, i);
      res += fold;
      i = offset;
    } else if (ch === "\\") {
      let next = source[++i];
      const cc = escapeCodes[next];
      if (cc)
        res += cc;
      else if (next === "\n") {
        next = source[i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "\r" && source[i + 1] === "\n") {
        next = source[++i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "x" || next === "u" || next === "U") {
        const length = next === "x" ? 2 : next === "u" ? 4 : 8;
        res += parseCharCode(source, i + 1, length, onError);
        i += length;
      } else {
        const raw = source.substr(i - 1, 2);
        onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        res += raw;
      }
    } else if (ch === " " || ch === "	") {
      const wsStart = i;
      let next = source[i + 1];
      while (next === " " || next === "	")
        next = source[++i + 1];
      if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
        res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
    } else {
      res += ch;
    }
  }
  if (source[source.length - 1] !== '"' || source.length === 1)
    onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
  return res;
}
function foldNewline(source, offset) {
  let fold = "";
  let ch = source[offset + 1];
  while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
    if (ch === "\r" && source[offset + 2] !== "\n")
      break;
    if (ch === "\n")
      fold += "\n";
    offset += 1;
    ch = source[offset + 1];
  }
  if (!fold)
    fold = " ";
  return { fold, offset };
}
var escapeCodes = {
  "0": "\0",
  // null character
  a: "\x07",
  // bell character
  b: "\b",
  // backspace
  e: "\x1B",
  // escape character
  f: "\f",
  // form feed
  n: "\n",
  // line feed
  r: "\r",
  // carriage return
  t: "	",
  // horizontal tab
  v: "\v",
  // vertical tab
  N: "\x85",
  // Unicode next line
  _: "\xA0",
  // Unicode non-breaking space
  L: "\u2028",
  // Unicode line separator
  P: "\u2029",
  // Unicode paragraph separator
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function parseCharCode(source, offset, length, onError) {
  const cc = source.substr(offset, length);
  const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
  const code = ok ? parseInt(cc, 16) : NaN;
  try {
    return String.fromCodePoint(code);
  } catch {
    const raw = source.substr(offset - 2, length + 2);
    onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
    return raw;
  }
}

// node_modules/yaml/browser/dist/compose/compose-scalar.js
function composeScalar(ctx, token, tagToken, onError) {
  const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar(ctx, token, onError) : resolveFlowScalar(token, ctx.options.strict, onError);
  const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
  let tag;
  if (ctx.options.stringKeys && ctx.atKey) {
    tag = ctx.schema[SCALAR];
  } else if (tagName)
    tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
  else if (token.type === "scalar")
    tag = findScalarTagByTest(ctx, value, token, onError);
  else
    tag = ctx.schema[SCALAR];
  let scalar;
  try {
    const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
    scalar = isScalar(res) ? res : new Scalar(res);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
    scalar = new Scalar(value);
  }
  scalar.range = range;
  scalar.source = value;
  if (type)
    scalar.type = type;
  if (tagName)
    scalar.tag = tagName;
  if (tag.format)
    scalar.format = tag.format;
  if (comment)
    scalar.comment = comment;
  return scalar;
}
function findScalarTagByName(schema4, value, tagName, tagToken, onError) {
  if (tagName === "!")
    return schema4[SCALAR];
  const matchWithTest = [];
  for (const tag of schema4.tags) {
    if (!tag.collection && tag.tag === tagName) {
      if (tag.default && tag.test)
        matchWithTest.push(tag);
      else
        return tag;
    }
  }
  for (const tag of matchWithTest)
    if (tag.test?.test(value))
      return tag;
  const kt = schema4.knownTags[tagName];
  if (kt && !kt.collection) {
    schema4.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
    return kt;
  }
  onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
  return schema4[SCALAR];
}
function findScalarTagByTest({ atKey, directives, schema: schema4 }, value, token, onError) {
  const tag = schema4.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema4[SCALAR];
  if (schema4.compat) {
    const compat = schema4.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema4[SCALAR];
    if (tag.tag !== compat.tag) {
      const ts = directives.tagString(tag.tag);
      const cs = directives.tagString(compat.tag);
      const msg = `Value may be parsed as either ${ts} or ${cs}`;
      onError(token, "TAG_RESOLVE_FAILED", msg, true);
    }
  }
  return tag;
}

// node_modules/yaml/browser/dist/compose/util-empty-scalar-position.js
function emptyScalarPosition(offset, before, pos) {
  if (before) {
    pos ?? (pos = before.length);
    for (let i = pos - 1; i >= 0; --i) {
      let st = before[i];
      switch (st.type) {
        case "space":
        case "comment":
        case "newline":
          offset -= st.source.length;
          continue;
      }
      st = before[++i];
      while (st?.type === "space") {
        offset += st.source.length;
        st = before[++i];
      }
      break;
    }
  }
  return offset;
}

// node_modules/yaml/browser/dist/compose/compose-node.js
var CN = { composeNode, composeEmptyNode };
function composeNode(ctx, token, props, onError) {
  const atKey = ctx.atKey;
  const { spaceBefore, comment, anchor, tag } = props;
  let node;
  let isSrcToken = true;
  switch (token.type) {
    case "alias":
      node = composeAlias(ctx, token, onError);
      if (anchor || tag)
        onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      node = composeScalar(ctx, token, tag, onError);
      if (anchor)
        node.anchor = anchor.source.substring(1);
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      try {
        node = composeCollection(CN, ctx, token, props, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        onError(token, "RESOURCE_EXHAUSTION", message);
      }
      break;
    default: {
      const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
      onError(token, "UNEXPECTED_TOKEN", message);
      isSrcToken = false;
    }
  }
  node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
  if (anchor && node.anchor === "")
    onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  if (atKey && ctx.options.stringKeys && (!isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
    const msg = "With stringKeys, all keys must be strings";
    onError(tag ?? token, "NON_STRING_KEY", msg);
  }
  if (spaceBefore)
    node.spaceBefore = true;
  if (comment) {
    if (token.type === "scalar" && token.source === "")
      node.comment = comment;
    else
      node.commentBefore = comment;
  }
  if (ctx.options.keepSourceTokens && isSrcToken)
    node.srcToken = token;
  return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
  const token = {
    type: "scalar",
    offset: emptyScalarPosition(offset, before, pos),
    indent: -1,
    source: ""
  };
  const node = composeScalar(ctx, token, tag, onError);
  if (anchor) {
    node.anchor = anchor.source.substring(1);
    if (node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  }
  if (spaceBefore)
    node.spaceBefore = true;
  if (comment) {
    node.comment = comment;
    node.range[2] = end;
  }
  return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
  const alias = new Alias(source.substring(1));
  if (alias.source === "")
    onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
  if (alias.source.endsWith(":"))
    onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
  const valueEnd = offset + source.length;
  const re = resolveEnd(end, valueEnd, options.strict, onError);
  alias.range = [offset, valueEnd, re.offset];
  if (re.comment)
    alias.comment = re.comment;
  return alias;
}

// node_modules/yaml/browser/dist/compose/compose-doc.js
function composeDoc(options, directives, { offset, start, value, end }, onError) {
  const opts = Object.assign({ _directives: directives }, options);
  const doc = new Document(void 0, opts);
  const ctx = {
    atKey: false,
    atRoot: true,
    directives: doc.directives,
    options: doc.options,
    schema: doc.schema
  };
  const props = resolveProps(start, {
    indicator: "doc-start",
    next: value ?? end?.[0],
    offset,
    onError,
    parentIndent: 0,
    startOnNewline: true
  });
  if (props.found) {
    doc.directives.docStart = true;
    if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
      onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
  }
  doc.contents = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
  const contentEnd = doc.contents.range[2];
  const re = resolveEnd(end, contentEnd, false, onError);
  if (re.comment)
    doc.comment = re.comment;
  doc.range = [offset, contentEnd, re.offset];
  return doc;
}

// node_modules/yaml/browser/dist/compose/composer.js
function getErrorPos(src) {
  if (typeof src === "number")
    return [src, src + 1];
  if (Array.isArray(src))
    return src.length === 2 ? src : [src[0], src[1]];
  const { offset, source } = src;
  return [offset, offset + (typeof source === "string" ? source.length : 1)];
}
function parsePrelude(prelude) {
  let comment = "";
  let atComment = false;
  let afterEmptyLine = false;
  for (let i = 0; i < prelude.length; ++i) {
    const source = prelude[i];
    switch (source[0]) {
      case "#":
        comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
        atComment = true;
        afterEmptyLine = false;
        break;
      case "%":
        if (prelude[i + 1]?.[0] !== "#")
          i += 1;
        atComment = false;
        break;
      default:
        if (!atComment)
          afterEmptyLine = true;
        atComment = false;
    }
  }
  return { comment, afterEmptyLine };
}
var Composer = class {
  constructor(options = {}) {
    this.doc = null;
    this.atDirectives = false;
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
    this.onError = (source, code, message, warning) => {
      const pos = getErrorPos(source);
      if (warning)
        this.warnings.push(new YAMLWarning(pos, code, message));
      else
        this.errors.push(new YAMLParseError(pos, code, message));
    };
    this.directives = new Directives({ version: options.version || "1.2" });
    this.options = options;
  }
  decorate(doc, afterDoc) {
    const { comment, afterEmptyLine } = parsePrelude(this.prelude);
    if (comment) {
      const dc = doc.contents;
      if (afterDoc) {
        doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
      } else if (afterEmptyLine || doc.directives.docStart || !dc) {
        doc.commentBefore = comment;
      } else if (isCollection(dc) && !dc.flow && dc.items.length > 0) {
        let it = dc.items[0];
        if (isPair(it))
          it = it.key;
        const cb = it.commentBefore;
        it.commentBefore = cb ? `${comment}
${cb}` : comment;
      } else {
        const cb = dc.commentBefore;
        dc.commentBefore = cb ? `${comment}
${cb}` : comment;
      }
    }
    if (afterDoc) {
      for (let i = 0; i < this.errors.length; ++i)
        doc.errors.push(this.errors[i]);
      for (let i = 0; i < this.warnings.length; ++i)
        doc.warnings.push(this.warnings[i]);
    } else {
      doc.errors = this.errors;
      doc.warnings = this.warnings;
    }
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: parsePrelude(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(tokens, forceDoc = false, endOffset = -1) {
    for (const token of tokens)
      yield* this.next(token);
    yield* this.end(forceDoc, endOffset);
  }
  /** Advance the composer by one CST token. */
  *next(token) {
    switch (token.type) {
      case "directive":
        this.directives.add(token.source, (offset, message, warning) => {
          const pos = getErrorPos(token);
          pos[0] += offset;
          this.onError(pos, "BAD_DIRECTIVE", message, warning);
        });
        this.prelude.push(token.source);
        this.atDirectives = true;
        break;
      case "document": {
        const doc = composeDoc(this.options, this.directives, token, this.onError);
        if (this.atDirectives && !doc.directives.docStart)
          this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
        this.decorate(doc, false);
        if (this.doc)
          yield this.doc;
        this.doc = doc;
        this.atDirectives = false;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(token.source);
        break;
      case "error": {
        const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
        const error = new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
        if (this.atDirectives || !this.doc)
          this.errors.push(error);
        else
          this.doc.errors.push(error);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const msg = "Unexpected doc-end without preceding document";
          this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
          break;
        }
        this.doc.directives.docEnd = true;
        const end = resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
        this.decorate(this.doc, true);
        if (end.comment) {
          const dc = this.doc.comment;
          this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
        }
        this.doc.range[2] = end.offset;
        break;
      }
      default:
        this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(forceDoc = false, endOffset = -1) {
    if (this.doc) {
      this.decorate(this.doc, true);
      yield this.doc;
      this.doc = null;
    } else if (forceDoc) {
      const opts = Object.assign({ _directives: this.directives }, this.options);
      const doc = new Document(void 0, opts);
      if (this.atDirectives)
        this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
      doc.range = [0, endOffset, endOffset];
      this.decorate(doc, false);
      yield doc;
    }
  }
};

// node_modules/yaml/browser/dist/parse/cst-visit.js
var BREAK2 = Symbol("break visit");
var SKIP2 = Symbol("skip children");
var REMOVE2 = Symbol("remove item");
function visit2(cst, visitor) {
  if ("type" in cst && cst.type === "document")
    cst = { start: cst.start, value: cst.value };
  _visit(Object.freeze([]), cst, visitor);
}
visit2.BREAK = BREAK2;
visit2.SKIP = SKIP2;
visit2.REMOVE = REMOVE2;
visit2.itemAtPath = (cst, path) => {
  let item = cst;
  for (const [field, index] of path) {
    const tok = item?.[field];
    if (tok && "items" in tok) {
      item = tok.items[index];
    } else
      return void 0;
  }
  return item;
};
visit2.parentCollection = (cst, path) => {
  const parent = visit2.itemAtPath(cst, path.slice(0, -1));
  const field = path[path.length - 1][0];
  const coll = parent?.[field];
  if (coll && "items" in coll)
    return coll;
  throw new Error("Parent collection not found");
};
function _visit(path, item, visitor) {
  let ctrl = visitor(item, path);
  if (typeof ctrl === "symbol")
    return ctrl;
  for (const field of ["key", "value"]) {
    const token = item[field];
    if (token && "items" in token) {
      for (let i = 0; i < token.items.length; ++i) {
        const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK2)
          return BREAK2;
        else if (ci === REMOVE2) {
          token.items.splice(i, 1);
          i -= 1;
        }
      }
      if (typeof ctrl === "function" && field === "key")
        ctrl = ctrl(item, path);
    }
  }
  return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
}

// node_modules/yaml/browser/dist/parse/cst.js
var BOM = "\uFEFF";
var DOCUMENT = "";
var FLOW_END = "";
var SCALAR2 = "";
function tokenType(source) {
  switch (source) {
    case BOM:
      return "byte-order-mark";
    case DOCUMENT:
      return "doc-mode";
    case FLOW_END:
      return "flow-error-end";
    case SCALAR2:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case "\n":
    case "\r\n":
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (source[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}

// node_modules/yaml/browser/dist/parse/lexer.js
function isEmpty(ch) {
  switch (ch) {
    case void 0:
    case " ":
    case "\n":
    case "\r":
    case "	":
      return true;
    default:
      return false;
  }
}
var hexDigits = new Set("0123456789ABCDEFabcdef");
var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
var flowIndicatorChars = new Set(",[]{}");
var invalidAnchorChars = new Set(" ,[]{}\n\r	");
var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
var Lexer = class {
  constructor() {
    this.atEnd = false;
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    this.buffer = "";
    this.flowKey = false;
    this.flowLevel = 0;
    this.indentNext = 0;
    this.indentValue = 0;
    this.lineEndPos = null;
    this.next = null;
    this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(source, incomplete = false) {
    if (source) {
      if (typeof source !== "string")
        throw TypeError("source is not a string");
      this.buffer = this.buffer ? this.buffer + source : source;
      this.lineEndPos = null;
    }
    this.atEnd = !incomplete;
    let next = this.next ?? "stream";
    while (next && (incomplete || this.hasChars(1)))
      next = yield* this.parseNext(next);
  }
  atLineEnd() {
    let i = this.pos;
    let ch = this.buffer[i];
    while (ch === " " || ch === "	")
      ch = this.buffer[++i];
    if (!ch || ch === "#" || ch === "\n")
      return true;
    if (ch === "\r")
      return this.buffer[i + 1] === "\n";
    return false;
  }
  charAt(n) {
    return this.buffer[this.pos + n];
  }
  continueScalar(offset) {
    let ch = this.buffer[offset];
    if (this.indentNext > 0) {
      let indent = 0;
      while (ch === " ")
        ch = this.buffer[++indent + offset];
      if (ch === "\r") {
        const next = this.buffer[indent + offset + 1];
        if (next === "\n" || !next && !this.atEnd)
          return offset + indent + 1;
      }
      return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
    }
    if (ch === "-" || ch === ".") {
      const dt = this.buffer.substr(offset, 3);
      if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
        return -1;
    }
    return offset;
  }
  getLine() {
    let end = this.lineEndPos;
    if (typeof end !== "number" || end !== -1 && end < this.pos) {
      end = this.buffer.indexOf("\n", this.pos);
      this.lineEndPos = end;
    }
    if (end === -1)
      return this.atEnd ? this.buffer.substring(this.pos) : null;
    if (this.buffer[end - 1] === "\r")
      end -= 1;
    return this.buffer.substring(this.pos, end);
  }
  hasChars(n) {
    return this.pos + n <= this.buffer.length;
  }
  setNext(state) {
    this.buffer = this.buffer.substring(this.pos);
    this.pos = 0;
    this.lineEndPos = null;
    this.next = state;
    return null;
  }
  peek(n) {
    return this.buffer.substr(this.pos, n);
  }
  *parseNext(next) {
    switch (next) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let line = this.getLine();
    if (line === null)
      return this.setNext("stream");
    if (line[0] === BOM) {
      yield* this.pushCount(1);
      line = line.substring(1);
    }
    if (line[0] === "%") {
      let dirEnd = line.length;
      let cs = line.indexOf("#");
      while (cs !== -1) {
        const ch = line[cs - 1];
        if (ch === " " || ch === "	") {
          dirEnd = cs - 1;
          break;
        } else {
          cs = line.indexOf("#", cs + 1);
        }
      }
      while (true) {
        const ch = line[dirEnd - 1];
        if (ch === " " || ch === "	")
          dirEnd -= 1;
        else
          break;
      }
      const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
      yield* this.pushCount(line.length - n);
      this.pushNewline();
      return "stream";
    }
    if (this.atLineEnd()) {
      const sp = yield* this.pushSpaces(true);
      yield* this.pushCount(line.length - sp);
      yield* this.pushNewline();
      return "stream";
    }
    yield DOCUMENT;
    return yield* this.parseLineStart();
  }
  *parseLineStart() {
    const ch = this.charAt(0);
    if (!ch && !this.atEnd)
      return this.setNext("line-start");
    if (ch === "-" || ch === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const s = this.peek(3);
      if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
        yield* this.pushCount(3);
        this.indentValue = 0;
        this.indentNext = 0;
        return s === "---" ? "doc" : "stream";
      }
    }
    this.indentValue = yield* this.pushSpaces(false);
    if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
      this.indentNext = this.indentValue;
    return yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [ch0, ch1] = this.peek(2);
    if (!ch1 && !this.atEnd)
      return this.setNext("block-start");
    if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
      this.indentNext = this.indentValue + 1;
      this.indentValue += n;
      return "block-start";
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(true);
    const line = this.getLine();
    if (line === null)
      return this.setNext("doc");
    let n = yield* this.pushIndicators();
    switch (line[n]) {
      case "#":
        yield* this.pushCount(line.length - n);
      // fallthrough
      case void 0:
        yield* this.pushNewline();
        return yield* this.parseLineStart();
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel = 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        return "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        n += yield* this.parseBlockScalarHeader();
        n += yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - n);
        yield* this.pushNewline();
        return yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let nl, sp;
    let indent = -1;
    do {
      nl = yield* this.pushNewline();
      if (nl > 0) {
        sp = yield* this.pushSpaces(false);
        this.indentValue = indent = sp;
      } else {
        sp = 0;
      }
      sp += yield* this.pushSpaces(true);
    } while (nl + sp > 0);
    const line = this.getLine();
    if (line === null)
      return this.setNext("flow");
    if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
      const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
      if (!atFlowEndMarker) {
        this.flowLevel = 0;
        yield FLOW_END;
        return yield* this.parseLineStart();
      }
    }
    let n = 0;
    while (line[n] === ",") {
      n += yield* this.pushCount(1);
      n += yield* this.pushSpaces(true);
      this.flowKey = false;
    }
    n += yield* this.pushIndicators();
    switch (line[n]) {
      case void 0:
        return "flow";
      case "#":
        yield* this.pushCount(line.length - n);
        return "flow";
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel += 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        this.flowKey = true;
        this.flowLevel -= 1;
        return this.flowLevel ? "flow" : "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "flow";
      case '"':
      case "'":
        this.flowKey = true;
        return yield* this.parseQuotedScalar();
      case ":": {
        const next = this.charAt(1);
        if (this.flowKey || isEmpty(next) || next === ",") {
          this.flowKey = false;
          yield* this.pushCount(1);
          yield* this.pushSpaces(true);
          return "flow";
        }
      }
      // fallthrough
      default:
        this.flowKey = false;
        return yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const quote = this.charAt(0);
    let end = this.buffer.indexOf(quote, this.pos + 1);
    if (quote === "'") {
      while (end !== -1 && this.buffer[end + 1] === "'")
        end = this.buffer.indexOf("'", end + 2);
    } else {
      while (end !== -1) {
        let n = 0;
        while (this.buffer[end - 1 - n] === "\\")
          n += 1;
        if (n % 2 === 0)
          break;
        end = this.buffer.indexOf('"', end + 1);
      }
    }
    const qb = this.buffer.substring(0, end);
    let nl = qb.indexOf("\n", this.pos);
    if (nl !== -1) {
      while (nl !== -1) {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = qb.indexOf("\n", cs);
      }
      if (nl !== -1) {
        end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
      }
    }
    if (end === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      end = this.buffer.length;
    }
    yield* this.pushToIndex(end + 1, false);
    return this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    let i = this.pos;
    while (true) {
      const ch = this.buffer[++i];
      if (ch === "+")
        this.blockScalarKeep = true;
      else if (ch > "0" && ch <= "9")
        this.blockScalarIndent = Number(ch) - 1;
      else if (ch !== "-")
        break;
    }
    return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
  }
  *parseBlockScalar() {
    let nl = this.pos - 1;
    let indent = 0;
    let ch;
    loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
      switch (ch) {
        case " ":
          indent += 1;
          break;
        case "\n":
          nl = i2;
          indent = 0;
          break;
        case "\r": {
          const next = this.buffer[i2 + 1];
          if (!next && !this.atEnd)
            return this.setNext("block-scalar");
          if (next === "\n")
            break;
        }
        // fallthrough
        default:
          break loop;
      }
    }
    if (!ch && !this.atEnd)
      return this.setNext("block-scalar");
    if (indent >= this.indentNext) {
      if (this.blockScalarIndent === -1)
        this.indentNext = indent;
      else {
        this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
      }
      do {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = this.buffer.indexOf("\n", cs);
      } while (nl !== -1);
      if (nl === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        nl = this.buffer.length;
      }
    }
    let i = nl + 1;
    ch = this.buffer[i];
    while (ch === " ")
      ch = this.buffer[++i];
    if (ch === "	") {
      while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
        ch = this.buffer[++i];
      nl = i - 1;
    } else if (!this.blockScalarKeep) {
      do {
        let i2 = nl - 1;
        let ch2 = this.buffer[i2];
        if (ch2 === "\r")
          ch2 = this.buffer[--i2];
        const lastChar = i2;
        while (ch2 === " ")
          ch2 = this.buffer[--i2];
        if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
          nl = i2;
        else
          break;
      } while (true);
    }
    yield SCALAR2;
    yield* this.pushToIndex(nl + 1, true);
    return yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const inFlow = this.flowLevel > 0;
    let end = this.pos - 1;
    let i = this.pos - 1;
    let ch;
    while (ch = this.buffer[++i]) {
      if (ch === ":") {
        const next = this.buffer[i + 1];
        if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
          break;
        end = i;
      } else if (isEmpty(ch)) {
        let next = this.buffer[i + 1];
        if (ch === "\r") {
          if (next === "\n") {
            i += 1;
            ch = "\n";
            next = this.buffer[i + 1];
          } else
            end = i;
        }
        if (next === "#" || inFlow && flowIndicatorChars.has(next))
          break;
        if (ch === "\n") {
          const cs = this.continueScalar(i + 1);
          if (cs === -1)
            break;
          i = Math.max(i, cs - 2);
        }
      } else {
        if (inFlow && flowIndicatorChars.has(ch))
          break;
        end = i;
      }
    }
    if (!ch && !this.atEnd)
      return this.setNext("plain-scalar");
    yield SCALAR2;
    yield* this.pushToIndex(end + 1, true);
    return inFlow ? "flow" : "doc";
  }
  *pushCount(n) {
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos += n;
      return n;
    }
    return 0;
  }
  *pushToIndex(i, allowEmpty) {
    const s = this.buffer.slice(this.pos, i);
    if (s) {
      yield s;
      this.pos += s.length;
      return s.length;
    } else if (allowEmpty)
      yield "";
    return 0;
  }
  *pushIndicators() {
    let n = 0;
    loop: while (true) {
      switch (this.charAt(0)) {
        case "!":
          n += yield* this.pushTag();
          n += yield* this.pushSpaces(true);
          continue loop;
        case "&":
          n += yield* this.pushUntil(isNotAnchorChar);
          n += yield* this.pushSpaces(true);
          continue loop;
        case "-":
        // this is an error
        case "?":
        // this is an error outside flow collections
        case ":": {
          const inFlow = this.flowLevel > 0;
          const ch1 = this.charAt(1);
          if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
            if (!inFlow)
              this.indentNext = this.indentValue + 1;
            else if (this.flowKey)
              this.flowKey = false;
            n += yield* this.pushCount(1);
            n += yield* this.pushSpaces(true);
            continue loop;
          }
        }
      }
      break loop;
    }
    return n;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let i = this.pos + 2;
      let ch = this.buffer[i];
      while (!isEmpty(ch) && ch !== ">")
        ch = this.buffer[++i];
      return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
    } else {
      let i = this.pos + 1;
      let ch = this.buffer[i];
      while (ch) {
        if (tagChars.has(ch))
          ch = this.buffer[++i];
        else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
          ch = this.buffer[i += 3];
        } else
          break;
      }
      return yield* this.pushToIndex(i, false);
    }
  }
  *pushNewline() {
    const ch = this.buffer[this.pos];
    if (ch === "\n")
      return yield* this.pushCount(1);
    else if (ch === "\r" && this.charAt(1) === "\n")
      return yield* this.pushCount(2);
    else
      return 0;
  }
  *pushSpaces(allowTabs) {
    let i = this.pos - 1;
    let ch;
    do {
      ch = this.buffer[++i];
    } while (ch === " " || allowTabs && ch === "	");
    const n = i - this.pos;
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos = i;
    }
    return n;
  }
  *pushUntil(test) {
    let i = this.pos;
    let ch = this.buffer[i];
    while (!test(ch))
      ch = this.buffer[++i];
    return yield* this.pushToIndex(i, false);
  }
};

// node_modules/yaml/browser/dist/parse/line-counter.js
var LineCounter = class {
  constructor() {
    this.lineStarts = [];
    this.addNewLine = (offset) => this.lineStarts.push(offset);
    this.linePos = (offset) => {
      let low = 0;
      let high = this.lineStarts.length;
      while (low < high) {
        const mid = low + high >> 1;
        if (this.lineStarts[mid] < offset)
          low = mid + 1;
        else
          high = mid;
      }
      if (this.lineStarts[low] === offset)
        return { line: low + 1, col: 1 };
      if (low === 0)
        return { line: 0, col: offset };
      const start = this.lineStarts[low - 1];
      return { line: low, col: offset - start + 1 };
    };
  }
};

// node_modules/yaml/browser/dist/parse/parser.js
function includesToken(list, type) {
  for (let i = 0; i < list.length; ++i)
    if (list[i].type === type)
      return true;
  return false;
}
function findNonEmptyIndex(list) {
  for (let i = 0; i < list.length; ++i) {
    switch (list[i].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return i;
    }
  }
  return -1;
}
function isFlowToken(token) {
  switch (token?.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return true;
    default:
      return false;
  }
}
function getPrevProps(parent) {
  switch (parent.type) {
    case "document":
      return parent.start;
    case "block-map": {
      const it = parent.items[parent.items.length - 1];
      return it.sep ?? it.start;
    }
    case "block-seq":
      return parent.items[parent.items.length - 1].start;
    /* istanbul ignore next should not happen */
    default:
      return [];
  }
}
function getFirstKeyStartProps(prev) {
  if (prev.length === 0)
    return [];
  let i = prev.length;
  loop: while (--i >= 0) {
    switch (prev[i].type) {
      case "doc-start":
      case "explicit-key-ind":
      case "map-value-ind":
      case "seq-item-ind":
      case "newline":
        break loop;
    }
  }
  while (prev[++i]?.type === "space") {
  }
  return prev.splice(i, prev.length);
}
function arrayPushArray(target, source) {
  if (source.length < 1e5)
    Array.prototype.push.apply(target, source);
  else
    for (let i = 0; i < source.length; ++i)
      target.push(source[i]);
}
function fixFlowSeqItems(fc) {
  if (fc.start.type === "flow-seq-start") {
    for (const it of fc.items) {
      if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
        if (it.key)
          it.value = it.key;
        delete it.key;
        if (isFlowToken(it.value)) {
          if (it.value.end)
            arrayPushArray(it.value.end, it.sep);
          else
            it.value.end = it.sep;
        } else
          arrayPushArray(it.start, it.sep);
        delete it.sep;
      }
    }
  }
}
var Parser = class {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(onNewLine) {
    this.atNewLine = true;
    this.atScalar = false;
    this.indent = 0;
    this.offset = 0;
    this.onKeyLine = false;
    this.stack = [];
    this.source = "";
    this.type = "";
    this.lexer = new Lexer();
    this.onNewLine = onNewLine;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(source, incomplete = false) {
    if (this.onNewLine && this.offset === 0)
      this.onNewLine(0);
    for (const lexeme of this.lexer.lex(source, incomplete))
      yield* this.next(lexeme);
    if (!incomplete)
      yield* this.end();
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(source) {
    this.source = source;
    if (this.atScalar) {
      this.atScalar = false;
      yield* this.step();
      this.offset += source.length;
      return;
    }
    const type = tokenType(source);
    if (!type) {
      const message = `Not a YAML token: ${source}`;
      yield* this.pop({ type: "error", offset: this.offset, message, source });
      this.offset += source.length;
    } else if (type === "scalar") {
      this.atNewLine = false;
      this.atScalar = true;
      this.type = "scalar";
    } else {
      this.type = type;
      yield* this.step();
      switch (type) {
        case "newline":
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine)
            this.onNewLine(this.offset + source.length);
          break;
        case "space":
          if (this.atNewLine && source[0] === " ")
            this.indent += source.length;
          break;
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
          if (this.atNewLine)
            this.indent += source.length;
          break;
        case "doc-mode":
        case "flow-error-end":
          return;
        default:
          this.atNewLine = false;
      }
      this.offset += source.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    while (this.stack.length > 0)
      yield* this.pop();
  }
  get sourceToken() {
    const st = {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
    return st;
  }
  *step() {
    const top = this.peek(1);
    if (this.type === "doc-end" && top?.type !== "doc-end") {
      while (this.stack.length > 0)
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!top)
      return yield* this.stream();
    switch (top.type) {
      case "document":
        return yield* this.document(top);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(top);
      case "block-scalar":
        return yield* this.blockScalar(top);
      case "block-map":
        return yield* this.blockMap(top);
      case "block-seq":
        return yield* this.blockSequence(top);
      case "flow-collection":
        return yield* this.flowCollection(top);
      case "doc-end":
        return yield* this.documentEnd(top);
    }
    yield* this.pop();
  }
  peek(n) {
    return this.stack[this.stack.length - n];
  }
  *pop(error) {
    const token = error ?? this.stack.pop();
    if (!token) {
      const message = "Tried to pop an empty stack";
      yield { type: "error", offset: this.offset, source: "", message };
    } else if (this.stack.length === 0) {
      yield token;
    } else {
      const top = this.peek(1);
      if (token.type === "block-scalar") {
        token.indent = "indent" in top ? top.indent : 0;
      } else if (token.type === "flow-collection" && top.type === "document") {
        token.indent = 0;
      }
      if (token.type === "flow-collection")
        fixFlowSeqItems(token);
      switch (top.type) {
        case "document":
          top.value = token;
          break;
        case "block-scalar":
          top.props.push(token);
          break;
        case "block-map": {
          const it = top.items[top.items.length - 1];
          if (it.value) {
            top.items.push({ start: [], key: token, sep: [] });
            this.onKeyLine = true;
            return;
          } else if (it.sep) {
            it.value = token;
          } else {
            Object.assign(it, { key: token, sep: [] });
            this.onKeyLine = !it.explicitKey;
            return;
          }
          break;
        }
        case "block-seq": {
          const it = top.items[top.items.length - 1];
          if (it.value)
            top.items.push({ start: [], value: token });
          else
            it.value = token;
          break;
        }
        case "flow-collection": {
          const it = top.items[top.items.length - 1];
          if (!it || it.value)
            top.items.push({ start: [], key: token, sep: [] });
          else if (it.sep)
            it.value = token;
          else
            Object.assign(it, { key: token, sep: [] });
          return;
        }
        /* istanbul ignore next should not happen */
        default:
          yield* this.pop();
          yield* this.pop(token);
      }
      if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
        const last = token.items[token.items.length - 1];
        if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
          if (top.type === "document")
            top.end = last.start;
          else
            top.items.push({ start: last.start });
          token.items.splice(-1, 1);
        }
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const doc = {
          type: "document",
          offset: this.offset,
          start: []
        };
        if (this.type === "doc-start")
          doc.start.push(this.sourceToken);
        this.stack.push(doc);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(doc) {
    if (doc.value)
      return yield* this.lineEnd(doc);
    switch (this.type) {
      case "doc-start": {
        if (findNonEmptyIndex(doc.start) !== -1) {
          yield* this.pop();
          yield* this.step();
        } else
          doc.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        doc.start.push(this.sourceToken);
        return;
    }
    const bv = this.startBlockValue(doc);
    if (bv)
      this.stack.push(bv);
    else {
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML document`,
        source: this.source
      };
    }
  }
  *scalar(scalar) {
    if (this.type === "map-value-ind") {
      const prev = getPrevProps(this.peek(2));
      const start = getFirstKeyStartProps(prev);
      let sep;
      if (scalar.end) {
        sep = scalar.end;
        sep.push(this.sourceToken);
        delete scalar.end;
      } else
        sep = [this.sourceToken];
      const map2 = {
        type: "block-map",
        offset: scalar.offset,
        indent: scalar.indent,
        items: [{ start, key: scalar, sep }]
      };
      this.onKeyLine = true;
      this.stack[this.stack.length - 1] = map2;
    } else
      yield* this.lineEnd(scalar);
  }
  *blockScalar(scalar) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        scalar.props.push(this.sourceToken);
        return;
      case "scalar":
        scalar.source = this.source;
        this.atNewLine = true;
        this.indent = 0;
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        yield* this.pop();
        break;
      /* istanbul ignore next should not happen */
      default:
        yield* this.pop();
        yield* this.step();
    }
  }
  *blockMap(map2) {
    const it = map2.items[map2.items.length - 1];
    switch (this.type) {
      case "newline":
        this.onKeyLine = false;
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if (last?.type === "comment")
            end?.push(this.sourceToken);
          else
            map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          it.start.push(this.sourceToken);
        }
        return;
      case "space":
      case "comment":
        if (it.value) {
          map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          if (this.atIndentedComment(it.start, map2.indent)) {
            const prev = map2.items[map2.items.length - 2];
            const end = prev?.value?.end;
            if (Array.isArray(end)) {
              arrayPushArray(end, it.start);
              end.push(this.sourceToken);
              map2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= map2.indent) {
      const atMapIndent = !this.onKeyLine && this.indent === map2.indent;
      const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
      let start = [];
      if (atNextItem && it.sep && !it.value) {
        const nl = [];
        for (let i = 0; i < it.sep.length; ++i) {
          const st = it.sep[i];
          switch (st.type) {
            case "newline":
              nl.push(i);
              break;
            case "space":
              break;
            case "comment":
              if (st.indent > map2.indent)
                nl.length = 0;
              break;
            default:
              nl.length = 0;
          }
        }
        if (nl.length >= 2)
          start = it.sep.splice(nl[1]);
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start });
            this.onKeyLine = true;
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "explicit-key-ind":
          if (!it.sep && !it.explicitKey) {
            it.start.push(this.sourceToken);
            it.explicitKey = true;
          } else if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start, explicitKey: true });
          } else {
            this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken], explicitKey: true }]
            });
          }
          this.onKeyLine = true;
          return;
        case "map-value-ind":
          if (it.explicitKey) {
            if (!it.sep) {
              if (includesToken(it.start, "newline")) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else {
                const start2 = getFirstKeyStartProps(it.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                });
              }
            } else if (it.value) {
              map2.items.push({ start: [], key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start, key: null, sep: [this.sourceToken] }]
              });
            } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
              const start2 = getFirstKeyStartProps(it.start);
              const key = it.key;
              const sep = it.sep;
              sep.push(this.sourceToken);
              delete it.key;
              delete it.sep;
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: start2, key, sep }]
              });
            } else if (start.length > 0) {
              it.sep = it.sep.concat(start, this.sourceToken);
            } else {
              it.sep.push(this.sourceToken);
            }
          } else {
            if (!it.sep) {
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            } else if (it.value || atNextItem) {
              map2.items.push({ start, key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [], key: null, sep: [this.sourceToken] }]
              });
            } else {
              it.sep.push(this.sourceToken);
            }
          }
          this.onKeyLine = true;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs = this.flowScalar(this.type);
          if (atNextItem || it.value) {
            map2.items.push({ start, key: fs, sep: [] });
            this.onKeyLine = true;
          } else if (it.sep) {
            this.stack.push(fs);
          } else {
            Object.assign(it, { key: fs, sep: [] });
            this.onKeyLine = true;
          }
          return;
        }
        default: {
          const bv = this.startBlockValue(map2);
          if (bv) {
            if (bv.type === "block-seq") {
              if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                yield* this.pop({
                  type: "error",
                  offset: this.offset,
                  message: "Unexpected block-seq-ind on same line with key",
                  source: this.source
                });
                return;
              }
            } else if (atMapIndent) {
              map2.items.push({ start });
            }
            this.stack.push(bv);
            return;
          }
        }
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *blockSequence(seq2) {
    const it = seq2.items[seq2.items.length - 1];
    switch (this.type) {
      case "newline":
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if (last?.type === "comment")
            end?.push(this.sourceToken);
          else
            seq2.items.push({ start: [this.sourceToken] });
        } else
          it.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (it.value)
          seq2.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(it.start, seq2.indent)) {
            const prev = seq2.items[seq2.items.length - 2];
            const end = prev?.value?.end;
            if (Array.isArray(end)) {
              arrayPushArray(end, it.start);
              end.push(this.sourceToken);
              seq2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (it.value || this.indent <= seq2.indent)
          break;
        it.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== seq2.indent)
          break;
        if (it.value || includesToken(it.start, "seq-item-ind"))
          seq2.items.push({ start: [this.sourceToken] });
        else
          it.start.push(this.sourceToken);
        return;
    }
    if (this.indent > seq2.indent) {
      const bv = this.startBlockValue(seq2);
      if (bv) {
        this.stack.push(bv);
        return;
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *flowCollection(fc) {
    const it = fc.items[fc.items.length - 1];
    if (this.type === "flow-error-end") {
      let top;
      do {
        yield* this.pop();
        top = this.peek(1);
      } while (top?.type === "flow-collection");
    } else if (fc.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          if (!it || it.sep)
            fc.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          if (!it || it.value)
            fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            Object.assign(it, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          if (!it || it.value)
            fc.items.push({ start: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            it.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs = this.flowScalar(this.type);
          if (!it || it.value)
            fc.items.push({ start: [], key: fs, sep: [] });
          else if (it.sep)
            this.stack.push(fs);
          else
            Object.assign(it, { key: fs, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          fc.end.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(fc);
      if (bv)
        this.stack.push(bv);
      else {
        yield* this.pop();
        yield* this.step();
      }
    } else {
      const parent = this.peek(2);
      if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
        yield* this.pop();
        yield* this.step();
      } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        fixFlowSeqItems(fc);
        const sep = fc.end.splice(1, fc.end.length);
        sep.push(this.sourceToken);
        const map2 = {
          type: "block-map",
          offset: fc.offset,
          indent: fc.indent,
          items: [{ start, key: fc, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map2;
      } else {
        yield* this.lineEnd(fc);
      }
    }
  }
  flowScalar(type) {
    if (this.onNewLine) {
      let nl = this.source.indexOf("\n") + 1;
      while (nl !== 0) {
        this.onNewLine(this.offset + nl);
        nl = this.source.indexOf("\n", nl) + 1;
      }
    }
    return {
      type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(parent) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        start.push(this.sourceToken);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, explicitKey: true }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(start, indent) {
    if (this.type !== "comment")
      return false;
    if (this.indent <= indent)
      return false;
    return start.every((st) => st.type === "newline" || st.type === "space");
  }
  *documentEnd(docEnd) {
    if (this.type !== "doc-mode") {
      if (docEnd.end)
        docEnd.end.push(this.sourceToken);
      else
        docEnd.end = [this.sourceToken];
      if (this.type === "newline")
        yield* this.pop();
    }
  }
  *lineEnd(token) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop();
        yield* this.step();
        break;
      case "newline":
        this.onKeyLine = false;
      // fallthrough
      case "space":
      case "comment":
      default:
        if (token.end)
          token.end.push(this.sourceToken);
        else
          token.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
    }
  }
};

// node_modules/yaml/browser/dist/public-api.js
function parseOptions(options) {
  const prettyErrors = options.prettyErrors !== false;
  const lineCounter = options.lineCounter || prettyErrors && new LineCounter() || null;
  return { lineCounter, prettyErrors };
}
function parseDocument(source, options = {}) {
  const { lineCounter, prettyErrors } = parseOptions(options);
  const parser = new Parser(lineCounter?.addNewLine);
  const composer = new Composer(options);
  let doc = null;
  for (const _doc of composer.compose(parser.parse(source), true, source.length)) {
    if (!doc)
      doc = _doc;
    else if (doc.options.logLevel !== "silent") {
      doc.errors.push(new YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  }
  if (prettyErrors && lineCounter) {
    doc.errors.forEach(prettifyError(source, lineCounter));
    doc.warnings.forEach(prettifyError(source, lineCounter));
  }
  return doc;
}

// src/adapters/expression-reference-adapter.ts
var identifierStart = /[\p{L}_$]/u;
var identifierPart = /[\p{L}\p{M}\p{N}_$]/u;
function isBoundary(value) {
  return value === void 0 || !identifierPart.test(value);
}
function isPropertyTerminator(value) {
  return isBoundary(value) && value !== "." && value !== "[" && value !== "(" && value !== "-";
}
function isDotPropertyName(value) {
  return /^[\p{L}_$][\p{L}\p{M}\p{N}_$]*$/u.test(value);
}
function skipLiteralOrComment(expression, index) {
  if (expression.startsWith("//", index)) {
    const newline = expression.indexOf("\n", index + 2);
    return newline < 0 ? expression.length : newline + 1;
  }
  if (expression.startsWith("/*", index)) {
    const closing = expression.indexOf("*/", index + 2);
    return closing < 0 ? expression.length : closing + 2;
  }
  const character = expression[index];
  if (character === '"' || character === "'") {
    const quote = character;
    index += 1;
    while (index < expression.length) {
      if (expression[index] === "\\") index += 2;
      else if (expression[index] === quote) return index + 1;
      else index += 1;
    }
    return expression.length;
  }
  if (character === "/") {
    let previousIndex = index - 1;
    while (previousIndex >= 0 && /\s/.test(expression[previousIndex] ?? "")) previousIndex -= 1;
    const previous = expression[previousIndex];
    if (previous === void 0 || /[=(,:!&|?+*%^<>[\]-]/.test(previous)) {
      index += 1;
      while (index < expression.length) {
        if (expression[index] === "\\") index += 2;
        else if (expression[index] === "/") return index + 1;
        else index += 1;
      }
      return expression.length;
    }
  }
  return void 0;
}
function scanExpression(expression) {
  const matches = [];
  let index = 0;
  while (index < expression.length) {
    const skipped = skipLiteralOrComment(expression, index);
    if (skipped !== void 0) {
      index = skipped;
      continue;
    }
    const character = expression[index];
    if (expression.startsWith("note.", index) && isBoundary(expression[index - 1])) {
      const nameStart = index + 5;
      let end = nameStart;
      while (end < expression.length && identifierPart.test(expression[end] ?? "")) end += 1;
      if (end > nameStart && isPropertyTerminator(expression[end])) {
        matches.push({
          propertyName: expression.slice(nameStart, end),
          confidence: "exact",
          syntaxForm: "note-prefixed",
          from: nameStart,
          to: end,
          evidence: expression.slice(index, end)
        });
        index = end;
        continue;
      }
    }
    if (character !== void 0 && identifierStart.test(character)) {
      const start = index;
      index += 1;
      while (index < expression.length && identifierPart.test(expression[index] ?? "")) index += 1;
      const name = expression.slice(start, index);
      const previous = expression[start - 1];
      const next = expression[index];
      if (previous !== "." && next !== "." && next !== "(") {
        matches.push({ propertyName: name, confidence: "probable", syntaxForm: "bare-identifier", from: start, to: index, evidence: name });
      }
      continue;
    }
    index += 1;
  }
  return matches;
}
function scanFormulaReferences(expression) {
  const references = [];
  let index = 0;
  while (index < expression.length) {
    const skipped = skipLiteralOrComment(expression, index);
    if (skipped !== void 0) {
      index = skipped;
      continue;
    }
    if (expression.startsWith("formula.", index) && isBoundary(expression[index - 1])) {
      const nameStart = index + 8;
      let end = nameStart;
      while (end < expression.length && identifierPart.test(expression[end] ?? "")) end += 1;
      if (end > nameStart && isPropertyTerminator(expression[end])) {
        references.push(expression.slice(nameStart, end));
        index = end;
        continue;
      }
    }
    index += 1;
  }
  return references;
}
function replaceExactProperty(expression, oldName, newName) {
  const replacements = scanExpression(expression).filter((match) => match.confidence === "exact" && match.propertyName === oldName);
  let text = expression;
  for (const match of [...replacements].sort((a, b) => b.from - a.from)) {
    text = `${text.slice(0, match.from)}${newName}${text.slice(match.to)}`;
  }
  return { text, replacements };
}

// src/adapters/bases-config-adapter.ts
var BASE_ADAPTER_VERSION = "bases-1.9-v1";
function pairKey(pair) {
  return isScalar(pair.key) && typeof pair.key.value === "string" ? pair.key.value : void 0;
}
function asNode(value) {
  return value;
}
function mapValue(map2, key) {
  return asNode(map2.items.find((pair) => pairKey(pair) === key)?.value);
}
function evidence(value) {
  return value.length <= 160 ? value : `${value.slice(0, 157)}...`;
}
function unknownShape(path, message, node) {
  const searchText = node?.toString();
  return { path, evidence: message, ...searchText ? { searchText } : {} };
}
function preserveLineEndings(output, source) {
  return source.includes("\r\n") ? output.replace(/(?<!\r)\n/g, "\r\n") : output;
}
async function addReference(context, reference) {
  context.references.push({ ...reference, id: (await sha256(`${reference.filePath}\0${reference.structuralPath.join("/")}\0${reference.propertyName}\0${reference.evidence}`)).slice(0, 20) });
}
async function scanExpressionScalar(node, path, kind, context, formulaOwner) {
  if (isScalar(node) && typeof node.value === "string") {
    for (const match of scanExpression(node.value)) {
      await addReference(context, {
        filePath: context.filePath,
        fileKind: "base",
        semanticKind: kind,
        structuralPath: path,
        syntaxForm: match.syntaxForm,
        propertyName: match.propertyName,
        confidence: match.confidence,
        range: { from: match.from, to: match.to },
        evidence: evidence(match.evidence)
      });
    }
    const formulaReferences = scanFormulaReferences(node.value);
    if (formulaOwner) context.formulaDependencies[formulaOwner] = formulaReferences;
    else context.formulaRoots.push(...formulaReferences);
  }
}
async function scanFilterNode(node, path, context) {
  if (node === void 0) return;
  if (isScalar(node) && typeof node.value === "string") {
    await scanExpressionScalar(node, path, "base-filter", context);
    return;
  }
  if (isMap(node) && node.items.length === 1) {
    const pair = node.items[0];
    const key = pair ? pairKey(pair) : void 0;
    const children = pair ? asNode(pair.value) : void 0;
    if (key !== void 0 && ["and", "or", "not"].includes(key) && isSeq(children)) {
      for (let index = 0; index < children.items.length; index += 1) await scanFilterNode(asNode(children.items[index]), [...path, key, index], context);
      return;
    }
  }
  context.unknownShapes.push(unknownShape(path, "filter must be an expression string or a single and/or/not array", node));
}
async function scanPropertyIds(node, path, kind, context) {
  if (isScalar(node) && typeof node.value === "string") {
    if (node.value.startsWith("note.") && node.value.length > 5) {
      await addReference(context, {
        filePath: context.filePath,
        fileKind: "base",
        semanticKind: kind,
        structuralPath: path,
        syntaxForm: "serialized-property-id",
        propertyName: node.value.slice(5),
        confidence: "exact",
        evidence: node.value
      });
    }
    if (node.value.startsWith("formula.")) context.formulaRoots.push(node.value.slice(8));
    return;
  }
  if (isSeq(node)) {
    for (let index = 0; index < node.items.length; index += 1) {
      const item = node.items[index];
      if (isMap(item)) {
        for (const pair of item.items) {
          const key = pairKey(pair);
          if (["property", "field", "column"].includes(key ?? "")) await scanPropertyIds(asNode(pair.value), [...path, index, key ?? "property"], kind, context);
        }
      } else await scanPropertyIds(asNode(item), [...path, index], kind, context);
    }
    return;
  }
  if (isMap(node)) {
    for (const pair of node.items) {
      const key = pairKey(pair);
      if (key !== void 0) await scanPropertyIds(asNode(pair.value), [...path, key], kind, context);
    }
  }
}
async function scanBaseDocument(document, context) {
  if (!isMap(document.contents)) throw new Error("Base root must be a mapping.");
  const root = document.contents;
  const known = /* @__PURE__ */ new Set(["filters", "properties", "formulas", "summaries", "views"]);
  for (const pair of root.items) {
    const key = pairKey(pair);
    if (key !== void 0 && !known.has(key)) context.unknownShapes.push(unknownShape([key], `Unknown top-level field: ${key}`));
  }
  await scanFilterNode(mapValue(root, "filters"), ["filters"], context);
  const properties = mapValue(root, "properties");
  if (isMap(properties)) {
    for (const pair of properties.items) {
      const key = pairKey(pair);
      if (key?.startsWith("note.") && key.length > 5) await addReference(context, {
        filePath: context.filePath,
        fileKind: "base",
        semanticKind: "base-property-config",
        structuralPath: ["properties", key],
        syntaxForm: "serialized-property-id",
        propertyName: key.slice(5),
        confidence: "exact",
        evidence: key
      });
    }
  } else if (properties !== void 0) context.unknownShapes.push(unknownShape(["properties"], "properties must be a mapping", properties));
  for (const section of ["formulas", "summaries"]) {
    const node = mapValue(root, section);
    if (isMap(node)) {
      for (const pair of node.items) {
        const key = pairKey(pair);
        if (key !== void 0 && section === "formulas") context.formulaDefinitions.push(key);
        const value = asNode(pair.value);
        if (key !== void 0 && value !== void 0) {
          if (isScalar(value) && typeof value.value === "string") await scanExpressionScalar(
            value,
            [section, key],
            section === "formulas" ? "base-formula" : "base-summary",
            context,
            section === "formulas" ? key : void 0
          );
          else context.unknownShapes.push(unknownShape([section, key], `${section} values must be expression strings`, value));
        }
      }
    } else if (node !== void 0) context.unknownShapes.push(unknownShape([section], `${section} must be a mapping`, node));
  }
  const views = mapValue(root, "views");
  if (views === void 0) return;
  if (!isSeq(views)) {
    context.unknownShapes.push(unknownShape(["views"], "views must be a sequence", views));
    return;
  }
  for (let index = 0; index < views.items.length; index += 1) {
    const view = views.items[index];
    if (!isMap(view)) {
      context.unknownShapes.push(unknownShape(["views", index], "view must be a mapping", asNode(view)));
      continue;
    }
    await scanFilterNode(mapValue(view, "filters"), ["views", index, "filters"], context);
    await scanPropertyIds(mapValue(view, "order"), ["views", index, "order"], "view-order", context);
    await scanPropertyIds(mapValue(view, "sort"), ["views", index, "sort"], "view-sort", context);
    await scanPropertyIds(mapValue(view, "groupBy"), ["views", index, "groupBy"], "view-group", context);
  }
}
async function parseBase(snapshot) {
  const context = { filePath: snapshot.path, references: [], formulaDefinitions: [], formulaRoots: [], formulaDependencies: {}, unknownShapes: [] };
  try {
    const sourceText = snapshot.text.startsWith("\uFEFF") ? snapshot.text.slice(1) : snapshot.text;
    const document = parseDocument(sourceText, { keepSourceTokens: true, prettyErrors: false, strict: true, uniqueKeys: true });
    if (document.errors.length > 0) throw new Error(document.errors[0]?.message ?? "Invalid Base YAML");
    await scanBaseDocument(document, context);
    return { snapshot, ...context };
  } catch (error) {
    return { snapshot, ...context, parseError: error instanceof Error ? error.message : "Unknown Base YAML error" };
  }
}
function transformExpressionScalar(node, oldName, newName, path, kind, operations) {
  if (isScalar(node) && typeof node.value === "string") {
    const result = replaceExactProperty(node.value, oldName, newName);
    if (result.replacements.length > 0) {
      node.value = result.text;
      for (const replacement of result.replacements) operations.push({ kind, structuralPath: path, before: replacement.evidence, after: `note.${newName}`, reason: `Update exact property reference in ${path.join(" > ")}` });
    }
    return;
  }
}
function transformFilterNode(node, oldName, newName, path, operations) {
  if (isScalar(node) && typeof node.value === "string") {
    transformExpressionScalar(node, oldName, newName, path, "base-filter", operations);
    return;
  }
  if (!isMap(node) || node.items.length !== 1) return;
  const pair = node.items[0];
  const key = pair ? pairKey(pair) : void 0;
  const children = pair ? asNode(pair.value) : void 0;
  if (key === void 0 || !["and", "or", "not"].includes(key) || !isSeq(children)) return;
  children.items.forEach((item, index) => transformFilterNode(asNode(item), oldName, newName, [...path, key, index], operations));
}
function hasExactExpressionReference(node, oldName) {
  if (isScalar(node) && typeof node.value === "string") return scanExpression(node.value).some((match) => match.confidence === "exact" && match.propertyName === oldName);
  return false;
}
function hasExactFilterReference(node, oldName) {
  if (hasExactExpressionReference(node, oldName)) return true;
  if (!isMap(node) || node.items.length !== 1) return false;
  const pair = node.items[0];
  const key = pair ? pairKey(pair) : void 0;
  const children = pair ? asNode(pair.value) : void 0;
  return key !== void 0 && ["and", "or", "not"].includes(key) && isSeq(children) ? children.items.some((item) => hasExactFilterReference(asNode(item), oldName)) : false;
}
function transformPropertyIds(node, oldId, newId, path, kind, operations) {
  if (isScalar(node) && node.value === oldId) {
    node.value = newId;
    operations.push({ kind, structuralPath: path, before: oldId, after: newId, reason: `Update property ID in ${path.join(" > ")}` });
  } else if (isSeq(node)) node.items.forEach((item, index) => transformPropertyIds(asNode(item), oldId, newId, [...path, index], kind, operations));
  else if (isMap(node)) node.items.forEach((pair) => {
    const key = pairKey(pair);
    if (["property", "field", "column"].includes(key ?? "")) transformPropertyIds(asNode(pair.value), oldId, newId, [...path, key ?? "property"], kind, operations);
  });
}
async function renameBaseReferences(text, oldName, newName, decision) {
  const operations = [];
  const blockers = [];
  const bom = text.startsWith("\uFEFF") ? "\uFEFF" : "";
  const sourceText = bom ? text.slice(1) : text;
  const document = parseDocument(sourceText, { keepSourceTokens: true, prettyErrors: false, strict: true, uniqueKeys: true });
  if (document.errors.length > 0 || !isMap(document.contents)) {
    blockers.push(document.errors[0]?.message ?? "Base root must be a mapping.");
    return { afterText: text, afterHash: await sha256(text), operations, blockers };
  }
  const root = document.contents;
  const expressionScalars = [];
  for (const section of ["formulas", "summaries"]) {
    const sectionNode = mapValue(root, section);
    if (isMap(sectionNode)) sectionNode.items.forEach((pair) => expressionScalars.push(asNode(pair.value)));
  }
  const viewsForValidation = mapValue(root, "views");
  const filterRoots = [mapValue(root, "filters")];
  if (isSeq(viewsForValidation)) {
    for (const view of viewsForValidation.items) if (isMap(view)) filterRoots.push(mapValue(view, "filters"));
  }
  if (!isDotPropertyName(newName) && (expressionScalars.some((node) => hasExactExpressionReference(node, oldName)) || filterRoots.some((node) => hasExactFilterReference(node, oldName)))) {
    blockers.push(`Property '${newName}' has no verified dot-access expression syntax. Expression references require manual review.`);
    return { afterText: text, afterHash: await sha256(text), operations, blockers };
  }
  transformFilterNode(mapValue(root, "filters"), oldName, newName, ["filters"], operations);
  for (const section of ["formulas", "summaries"]) {
    const node = mapValue(root, section);
    if (isMap(node)) node.items.forEach((pair) => {
      const key = pairKey(pair);
      const value = asNode(pair.value);
      if (key !== void 0 && isScalar(value) && typeof value.value === "string") transformExpressionScalar(value, oldName, newName, [section, key], section === "formulas" ? "base-formula" : "base-summary", operations);
    });
  }
  const properties = mapValue(root, "properties");
  const oldId = `note.${oldName}`;
  const newId = `note.${newName}`;
  if (isMap(properties)) {
    const sourceIndex = properties.items.findIndex((pair) => pairKey(pair) === oldId);
    const targetIndex = properties.items.findIndex((pair) => pairKey(pair) === newId);
    if (sourceIndex >= 0 && targetIndex >= 0) {
      if (decision === "block") blockers.push(`Both ${oldId} and ${newId} property configurations exist.`);
      else if (decision === "keep-target") properties.items.splice(sourceIndex, 1);
      else {
        const source = properties.items[sourceIndex];
        const target = properties.items[targetIndex];
        if (source && target) target.value = source.value;
        properties.items.splice(sourceIndex, 1);
      }
    } else if (sourceIndex >= 0) {
      const pair = properties.items[sourceIndex];
      if (pair?.key instanceof Scalar) pair.key.value = newId;
    }
    if (sourceIndex >= 0 && blockers.length === 0) operations.push({ kind: "base-property-config", structuralPath: ["properties", oldId], before: oldId, after: newId, reason: "Rename property display configuration" });
  }
  const views = mapValue(root, "views");
  if (isSeq(views)) views.items.forEach((view, index) => {
    if (!isMap(view)) return;
    transformFilterNode(mapValue(view, "filters"), oldName, newName, ["views", index, "filters"], operations);
    transformPropertyIds(mapValue(view, "order"), oldId, newId, ["views", index, "order"], "view-order", operations);
    transformPropertyIds(mapValue(view, "sort"), oldId, newId, ["views", index, "sort"], "view-sort", operations);
    transformPropertyIds(mapValue(view, "groupBy"), oldId, newId, ["views", index, "groupBy"], "view-group", operations);
  });
  if (blockers.length > 0) return { afterText: text, afterHash: await sha256(text), operations: [], blockers };
  const afterText = `${bom}${preserveLineEndings(document.toString({ lineWidth: 0 }), sourceText)}`;
  return { afterText, afterHash: await sha256(afterText), operations, blockers };
}

// src/adapters/markdown-frontmatter-adapter.ts
function splitFrontmatter(text) {
  const bom = text.startsWith("\uFEFF") ? "\uFEFF" : "";
  const content = bom ? text.slice(1) : text;
  const openingMatch = /^(---[ \t]*\r?\n)/.exec(content);
  if (!openingMatch) return void 0;
  const yamlStart = openingMatch[0].length;
  const closingMatch = /^(---|\.\.\.)[ \t]*(\r?\n|$)/m.exec(content.slice(yamlStart));
  if (!closingMatch) return void 0;
  const closeStart = yamlStart + closingMatch.index;
  const closeEnd = closeStart + closingMatch[0].length;
  return {
    bom,
    opening: content.slice(0, yamlStart),
    yaml: content.slice(yamlStart, closeStart),
    closing: content.slice(closeStart, closeEnd),
    body: content.slice(closeEnd)
  };
}
function valueKind(value) {
  if (value === null || value === void 0) return "null";
  if (Array.isArray(value)) return "list";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "object";
  }
}
function parseYamlMap(yaml) {
  return parseDocument(yaml, { keepSourceTokens: true, prettyErrors: false, strict: true, uniqueKeys: true });
}
function preserveLineEndings2(output, source) {
  return source.includes("\r\n") ? output.replace(/(?<!\r)\n/g, "\r\n") : output;
}
function scalarKey(pair) {
  return pair.key instanceof Scalar && typeof pair.key.value === "string" ? pair.key.value : void 0;
}
function nodeValue(value) {
  return value !== null && typeof value === "object" && "toJSON" in value && typeof value.toJSON === "function" ? value.toJSON() : value;
}
function parseMarkdown(snapshot) {
  const properties = /* @__PURE__ */ new Map();
  const slice = splitFrontmatter(snapshot.text);
  if (!slice) return Promise.resolve({ snapshot, properties });
  try {
    const document = parseYamlMap(slice.yaml);
    if (document.errors.length > 0) throw new Error(document.errors[0]?.message ?? "Invalid Frontmatter YAML");
    if (document.contents !== null && !isMap(document.contents)) throw new Error("Frontmatter root must be a mapping.");
    if (isMap(document.contents)) {
      for (const pair of document.contents.items) {
        const key = scalarKey(pair);
        if (key !== void 0) properties.set(key, valueKind(nodeValue(pair.value)));
      }
    }
    return Promise.resolve({ snapshot, properties });
  } catch (error) {
    return Promise.resolve({ snapshot, properties, parseError: error instanceof Error ? error.message : "Unknown YAML error" });
  }
}
function mergeLists(target, source) {
  const merged = [...target];
  for (const item of source) {
    const fingerprint = stableStringify(item);
    if (!merged.some((existing) => stableStringify(existing) === fingerprint)) merged.push(item);
  }
  return merged;
}
async function renameFrontmatterKey(text, oldName, newName, decision) {
  const blockers = [];
  const operations = [];
  const slice = splitFrontmatter(text);
  if (!slice) return { afterText: text, afterHash: await sha256(text), operations, blockers };
  const document = parseYamlMap(slice.yaml);
  if (document.errors.length > 0 || !isMap(document.contents)) {
    blockers.push(document.errors[0]?.message ?? "Frontmatter root is not a mapping.");
    return { afterText: text, afterHash: await sha256(text), operations, blockers };
  }
  const map2 = document.contents;
  const sourceIndex = map2.items.findIndex((pair) => scalarKey(pair) === oldName);
  const targetIndex = map2.items.findIndex((pair) => scalarKey(pair) === newName);
  if (sourceIndex < 0) return { afterText: text, afterHash: await sha256(text), operations, blockers };
  const sourcePair = map2.items[sourceIndex];
  if (!sourcePair) return { afterText: text, afterHash: await sha256(text), operations, blockers };
  if (targetIndex >= 0 && targetIndex !== sourceIndex) {
    if (decision === "block") blockers.push(`Both ${oldName} and ${newName} exist.`);
    else if (decision === "keep-target") map2.items.splice(sourceIndex, 1);
    else if (decision === "keep-source") {
      const targetPair = map2.items[targetIndex];
      if (targetPair) targetPair.value = sourcePair.value;
      map2.items.splice(sourceIndex, 1);
    } else {
      const targetPair = map2.items[targetIndex];
      const targetValue = nodeValue(targetPair?.value);
      const sourceValue = nodeValue(sourcePair.value);
      if (!Array.isArray(targetValue) || !Array.isArray(sourceValue) || !targetPair) blockers.push("Merge lists requires both values to be lists.");
      else {
        targetPair.value = document.createNode(mergeLists(targetValue, sourceValue));
        map2.items.splice(sourceIndex, 1);
      }
    }
  } else if (sourcePair.key instanceof Scalar) {
    sourcePair.key.value = newName;
    if (/^(?:true|false|null|yes|no|on|off|[-+]?\d)/i.test(newName) || /[:#[\]{},&*!|>'"%@`]/.test(newName)) {
      sourcePair.key.type = Scalar.QUOTE_DOUBLE;
    }
  }
  if (blockers.length > 0) return { afterText: text, afterHash: await sha256(text), operations, blockers };
  operations.push({ kind: "frontmatter-key", structuralPath: [oldName], before: oldName, after: newName, reason: `Rename top-level property ${oldName} to ${newName}` });
  const yaml = preserveLineEndings2(document.toString({ lineWidth: 0 }), slice.yaml);
  const afterText = `${slice.bom}${slice.opening}${yaml}${slice.closing}${slice.body}`;
  return { afterText, afterHash: await sha256(afterText), operations, blockers };
}

// src/inventory/vault-inventory.ts
var VaultInventory = class {
  constructor(vault) {
    this.vault = vault;
  }
  async scan(options = {}) {
    const files = this.vault.getFiles().filter((file) => file.extension === "md" || file.extension === "base").sort((a, b) => a.path.localeCompare(b.path));
    const snapshots = [];
    const markdown = [];
    const bases = [];
    const errors = [];
    const propertyTypes = /* @__PURE__ */ new Map();
    let cursor = 0;
    let processed = 0;
    let definitions = 0;
    let exactReferences = 0;
    const worker = async () => {
      while (cursor < files.length) {
        options.signal?.throwIfAborted();
        const file = files[cursor++];
        if (!file) return;
        try {
          const text = await this.vault.cachedRead(file);
          const snapshot = await createSnapshot(file, text);
          if (snapshot.kind === "markdown") {
            const parsed = await parseMarkdown(snapshot);
            const metadataSnapshot = { ...snapshot, text: "" };
            snapshots.push(metadataSnapshot);
            markdown.push({ ...parsed, snapshot: metadataSnapshot });
            definitions += parsed.properties.size;
            if (parsed.parseError) errors.push({ path: file.path, message: parsed.parseError });
            for (const [name, kind] of parsed.properties) {
              const kinds = propertyTypes.get(name) ?? /* @__PURE__ */ new Set();
              kinds.add(kind);
              propertyTypes.set(name, kinds);
            }
          } else {
            snapshots.push(snapshot);
            const parsed = await parseBase(snapshot);
            bases.push(parsed);
            exactReferences += parsed.references.filter((reference) => reference.confidence === "exact").length;
            if (parsed.parseError) errors.push({ path: file.path, message: parsed.parseError });
          }
        } catch (error) {
          errors.push({ path: file.path, message: error instanceof Error ? error.message : "Unknown read error" });
        }
        processed += 1;
        options.onProgress?.({ processed, total: files.length, definitions, exactReferences, warnings: errors.length });
        if (processed % 25 === 0) await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
    };
    await Promise.all(Array.from({ length: Math.min(options.concurrency ?? 8, Math.max(1, files.length)) }, worker));
    snapshots.sort((a, b) => a.path.localeCompare(b.path));
    markdown.sort((a, b) => a.snapshot.path.localeCompare(b.snapshot.path));
    bases.sort((a, b) => a.snapshot.path.localeCompare(b.snapshot.path));
    const references = bases.flatMap((base) => base.references).sort((a, b) => a.id.localeCompare(b.id));
    const revision = await sha256(stableStringify(snapshots.map(({ path, contentHash }) => ({ path, contentHash }))));
    return { revision, snapshots, markdown, bases, propertyTypes, references, errors };
  }
};
async function createSnapshot(file, text) {
  return { path: file.path, kind: file.extension === "md" ? "markdown" : "base", text, contentHash: await sha256(text), mtime: file.stat.mtime, size: file.stat.size };
}

// src/planning/plan-builder.ts
function decisionFor(request, path) {
  return request.conflictDecisions?.[path] ?? request.defaultConflictDecision;
}
function baseDecisionFor(request, path) {
  const decision = request.conflictDecisions?.[path];
  return decision === "keep-target" || decision === "keep-source" ? decision : "block";
}
async function planFinding(ruleId, path, message, evidence2, severity = "blocker", confidence = "exact", structuralPath) {
  const fingerprint = await sha256(stableStringify({ ruleId, path, evidence: evidence2, structuralPath }));
  return {
    id: fingerprint.slice(0, 20),
    ruleId,
    severity,
    filePath: path,
    confidence,
    message,
    fingerprint,
    suggestedAction: "manual-review",
    ...evidence2 ? { evidence: evidence2 } : {},
    ...structuralPath ? { structuralPath } : {}
  };
}
function sourceRecord(snapshots) {
  return Object.fromEntries(snapshots.map(({ path, contentHash, mtime, size }) => [path, { contentHash, mtime, size }]));
}
async function buildRenamePlan(inventory, input, now = (/* @__PURE__ */ new Date()).toISOString(), readText, includeTextMatches = false) {
  const request = {
    oldName: input.oldName,
    newName: input.newName,
    defaultConflictDecision: input.defaultConflictDecision,
    ...input.conflictDecisions ? { conflictDecisions: Object.fromEntries(Object.entries(input.conflictDecisions).sort(([a], [b]) => a.localeCompare(b))) } : {},
    ...input.excludedPaths ? { excludedPaths: [...input.excludedPaths].sort() } : {}
  };
  const excluded = new Set(request.excludedPaths ?? []);
  const fileChanges = [];
  const unresolvedFindings = [];
  const exclusions = [];
  for (const error of validateRename(request.oldName, request.newName)) unresolvedFindings.push(await planFinding("INVALID_REQUEST", "", error));
  for (const markdown of inventory.markdown) {
    if (!markdown.properties.has(request.oldName)) continue;
    if (excluded.has(markdown.snapshot.path)) {
      exclusions.push({ path: markdown.snapshot.path, remainingReferences: 1 });
      continue;
    }
    const beforeText = markdown.snapshot.text !== "" || markdown.snapshot.size === 0 ? markdown.snapshot.text : readText ? await readText(markdown.snapshot.path) : void 0;
    if (beforeText === void 0) {
      unresolvedFindings.push(await planFinding("SOURCE_NOT_LOADED", markdown.snapshot.path, "The source file must be reread before planning."));
      continue;
    }
    if (await sha256(beforeText) !== markdown.snapshot.contentHash) {
      unresolvedFindings.push(await planFinding("STALE_SOURCE", markdown.snapshot.path, "The source file changed after the inventory scan. Rescan before planning."));
      continue;
    }
    const result = await renameFrontmatterKey(beforeText, request.oldName, request.newName, decisionFor(request, markdown.snapshot.path));
    for (const blocker of result.blockers) unresolvedFindings.push(await planFinding("MARKDOWN_CONFLICT", markdown.snapshot.path, blocker));
    if (result.afterText !== beforeText && result.blockers.length === 0) fileChanges.push({
      path: markdown.snapshot.path,
      kind: "markdown",
      beforeHash: markdown.snapshot.contentHash,
      beforeText,
      afterText: result.afterText,
      afterHash: result.afterHash,
      operations: result.operations,
      validation: { valid: true, warnings: [], blockers: [] }
    });
  }
  for (const base of inventory.bases) {
    const oldReferences = base.references.filter((reference) => reference.propertyName === request.oldName && reference.confidence === "exact");
    const reviewReferences = base.references.filter(
      (reference) => reference.propertyName === request.oldName && reference.confidence !== "exact" && (reference.confidence !== "text" || includeTextMatches)
    );
    for (const reference of reviewReferences) {
      unresolvedFindings.push(await planFinding(
        "LOW_CONFIDENCE_REFERENCE",
        base.snapshot.path,
        `A ${reference.confidence} reference to '${request.oldName}' requires manual review and will not be changed.`,
        reference.evidence,
        "warning",
        reference.confidence,
        reference.structuralPath
      ));
    }
    const suspiciousText = base.snapshot.text.includes(request.oldName);
    if (base.parseError) {
      if (suspiciousText) unresolvedFindings.push(await planFinding("UNPARSEABLE_BASE", base.snapshot.path, "This Base may contain the old property but cannot be parsed.", base.parseError));
      continue;
    }
    const riskyUnknown = base.unknownShapes.find((shape) => shape.path[0] !== void 0 && ["filters", "properties", "formulas", "summaries", "views"].includes(String(shape.path[0])) && shape.searchText?.includes(request.oldName));
    if (riskyUnknown) unresolvedFindings.push(await planFinding("UNKNOWN_BASE_SHAPE", base.snapshot.path, "An unknown node in a known reference field may contain the old property.", riskyUnknown.evidence));
    if (oldReferences.length === 0) continue;
    if (excluded.has(base.snapshot.path)) {
      exclusions.push({ path: base.snapshot.path, remainingReferences: oldReferences.length });
      continue;
    }
    const result = await renameBaseReferences(base.snapshot.text, request.oldName, request.newName, baseDecisionFor(request, base.snapshot.path));
    for (const blocker of result.blockers) unresolvedFindings.push(await planFinding("BASE_CONFLICT", base.snapshot.path, blocker));
    if (result.afterText !== base.snapshot.text && result.blockers.length === 0) {
      const parsedAfter = await parseBase({ ...base.snapshot, text: result.afterText, contentHash: result.afterHash, size: new TextEncoder().encode(result.afterText).length });
      const remaining = parsedAfter.references.filter((reference) => reference.propertyName === request.oldName && reference.confidence === "exact");
      const blockers = [...parsedAfter.parseError ? [parsedAfter.parseError] : [], ...remaining.length > 0 ? [`${remaining.length} exact references remain.`] : []];
      if (blockers.length > 0) unresolvedFindings.push(await planFinding("PLAN_VALIDATION", base.snapshot.path, blockers.join(" ")));
      else fileChanges.push({
        path: base.snapshot.path,
        kind: "base",
        beforeHash: base.snapshot.contentHash,
        beforeText: base.snapshot.text,
        afterText: result.afterText,
        afterHash: result.afterHash,
        operations: result.operations,
        validation: { valid: true, warnings: [], blockers: [] }
      });
    }
  }
  fileChanges.sort((a, b) => a.path.localeCompare(b.path));
  exclusions.sort((a, b) => a.path.localeCompare(b.path));
  if (fileChanges.length === 0 && unresolvedFindings.length === 0) unresolvedFindings.push(await planFinding("EMPTY_PLAN", "", "No old property definitions or references were found."));
  const planSeed = { inventoryRevision: inventory.revision, adapterVersion: BASE_ADAPTER_VERSION, request, changes: fileChanges.map(({ path, beforeHash, afterHash, operations }) => ({ path, beforeHash, afterHash, operations })), exclusions };
  const planId = (await sha256(stableStringify(planSeed))).slice(0, 24);
  return {
    schemaVersion: 1,
    planId,
    inventoryRevision: inventory.revision,
    adapterVersion: BASE_ADAPTER_VERSION,
    createdAt: now,
    request,
    sourceSnapshots: sourceRecord(inventory.snapshots),
    fileChanges,
    unresolvedFindings,
    exclusions,
    status: unresolvedFindings.some((item) => item.severity === "blocker") || fileChanges.length === 0 ? "draft" : "ready"
  };
}

// src/planning/plan-validator.ts
async function checkPlanFreshness(vault, plan) {
  const changedPaths = [];
  const missingPaths = [];
  const newCandidatePaths = [];
  const known = new Set(Object.keys(plan.sourceSnapshots));
  const files = vault.getFiles().filter((file) => file.extension === "md" || file.extension === "base");
  const byPath = new Map(files.map((file) => [file.path, file]));
  if (plan.adapterVersion === "restore-v1") {
    for (const change of plan.fileChanges) {
      const file = byPath.get(change.path);
      if (!file) {
        missingPaths.push(change.path);
        continue;
      }
      if (await sha256(await vault.cachedRead(file)) !== change.beforeHash) changedPaths.push(change.path);
    }
  } else {
    for (const [path, snapshot] of Object.entries(plan.sourceSnapshots)) {
      const file = byPath.get(path);
      if (!file) {
        missingPaths.push(path);
        continue;
      }
      if (await sha256(await vault.cachedRead(file)) !== snapshot.contentHash) changedPaths.push(path);
    }
    for (const file of files) {
      if (known.has(file.path)) continue;
      const text = await vault.cachedRead(file);
      if (text.includes(plan.request.oldName)) newCandidatePaths.push(file.path);
    }
  }
  return { fresh: changedPaths.length === 0 && missingPaths.length === 0 && newCandidatePaths.length === 0, changedPaths, missingPaths, newCandidatePaths };
}

// src/transaction/verifier.ts
async function verifyPlanApplied(files, plan) {
  const errors = [];
  for (const change of plan.fileChanges) {
    const text = await files.read(change.path);
    const hash = await sha256(text);
    if (hash !== change.afterHash) {
      errors.push(`${change.path}: written bytes differ from the reviewed plan`);
      continue;
    }
    const snapshot = { path: change.path, kind: change.kind, text, contentHash: hash, mtime: 0, size: text.length };
    const isRestore = plan.adapterVersion === "restore-v1";
    if (change.kind === "markdown") {
      const parsed = await parseMarkdown(snapshot);
      if (parsed.parseError) errors.push(`${change.path}: ${parsed.parseError}`);
      if (!isRestore) {
        if (parsed.properties.has(plan.request.oldName)) errors.push(`${change.path}: old property remains`);
        if (!parsed.properties.has(plan.request.newName)) errors.push(`${change.path}: new property is missing`);
      }
    } else {
      const parsed = await parseBase(snapshot);
      if (parsed.parseError) errors.push(`${change.path}: ${parsed.parseError}`);
      if (!isRestore && parsed.references.some((reference) => reference.confidence === "exact" && reference.propertyName === plan.request.oldName)) errors.push(`${change.path}: exact old references remain`);
    }
  }
  return errors;
}

// src/transaction/executor.ts
var TransactionExecutor = class {
  constructor(files, snapshots, createTransactionId = () => crypto.randomUUID()) {
    this.files = files;
    this.snapshots = snapshots;
    this.createTransactionId = createTransactionId;
  }
  active = false;
  async execute(plan, hooks = {}) {
    if (this.active) throw new Error("Another Schema Refactor transaction is already running.");
    if (plan.status !== "ready" || plan.fileChanges.length === 0) throw new Error("Only a non-empty ready plan can be applied.");
    this.active = true;
    const transactionId = this.createTransactionId();
    let manifest;
    let stage = "PREPARING";
    try {
      hooks.onState?.(stage);
      await hooks.injectFailure?.("before-freshness");
      for (const change of plan.fileChanges) {
        if (!await this.files.exists(change.path) || await sha256(await this.files.read(change.path)) !== change.beforeHash) throw new Error(`Plan is stale: ${change.path}`);
      }
      stage = "SNAPSHOTTING";
      hooks.onState?.(stage);
      await hooks.injectFailure?.("before-snapshot-manifest");
      manifest = await this.snapshots.create(transactionId, plan);
      const incompleteSnapshot = manifest.entries.find((entry) => !entry.snapshotted);
      if (incompleteSnapshot) throw new Error(`Snapshot creation failed: ${incompleteSnapshot.path}`);
      await hooks.injectFailure?.("after-snapshot-manifest");
      stage = "WRITING";
      await this.snapshots.updateState(manifest, stage);
      for (const change of [...plan.fileChanges].sort((a, b) => a.path.localeCompare(b.path))) {
        hooks.onState?.(stage, change.path);
        await hooks.injectFailure?.("before-write", change.path);
        if (await sha256(await this.files.read(change.path)) !== change.beforeHash) throw new Error(`File changed during apply: ${change.path}`);
        const entry = manifest.entries.find((item) => item.path === change.path);
        if (entry) entry.written = true;
        await this.snapshots.save(manifest);
        await hooks.injectFailure?.("after-write-intent", change.path);
        if (await sha256(await this.files.read(change.path)) !== change.beforeHash) throw new Error(`File changed before write: ${change.path}`);
        await this.files.write(change.path, change.afterText);
        const writtenHash = await sha256(await this.files.read(change.path));
        if (entry) entry.writtenHash = writtenHash;
        await this.snapshots.save(manifest);
        await hooks.injectFailure?.("after-write", change.path);
        if (writtenHash !== change.afterHash) throw new Error(`Write verification failed: ${change.path}`);
      }
      stage = "VERIFYING";
      await this.snapshots.updateState(manifest, stage);
      hooks.onState?.(stage);
      await hooks.injectFailure?.("before-verification");
      const verificationErrors = await verifyPlanApplied(this.files, plan);
      if (verificationErrors.length > 0) throw new Error(verificationErrors.join("; "));
      manifest.verified = manifest.entries.map((entry) => entry.path);
      stage = "COMPLETED";
      await this.snapshots.updateState(manifest, stage);
      hooks.onState?.(stage);
      return resultFrom(manifest, "COMPLETED");
    } catch (error) {
      if (!manifest) throw error;
      manifest.errors.push({ stage, message: error instanceof Error ? error.message : "Unknown transaction error" });
      return await this.rollback(manifest, hooks);
    } finally {
      this.active = false;
    }
  }
  async recover(manifest, hooks = {}) {
    if (["COMPLETED", "ROLLED_BACK", "ROLLBACK_INCOMPLETE"].includes(manifest.state)) return void 0;
    if (!manifest.entries.some((entry) => entry.written)) {
      await this.snapshots.updateState(manifest, "CANCELLED");
      return void 0;
    }
    return this.rollback(manifest, hooks);
  }
  async rollback(manifest, hooks) {
    manifest.state = "ROLLING_BACK";
    await this.snapshots.save(manifest);
    const incomplete = [];
    for (const entry of [...manifest.entries].reverse()) {
      if (!entry.written || entry.rollbackRestored) continue;
      hooks.onState?.("ROLLING_BACK", entry.path);
      try {
        await hooks.injectFailure?.("before-rollback", entry.path);
        const currentHash = await this.files.exists(entry.path) ? await sha256(await this.files.read(entry.path)) : void 0;
        if (currentHash === entry.beforeHash) {
          entry.rollbackRestored = true;
          await this.snapshots.save(manifest);
          continue;
        }
        if (currentHash === void 0 || currentHash !== entry.afterHash && currentHash !== entry.writtenHash) {
          incomplete.push(entry.path);
          continue;
        }
        const beforeText = await this.snapshots.readSnapshot(manifest.transactionId, entry);
        await hooks.injectFailure?.("before-rollback-write", entry.path);
        const guardedHash = await sha256(await this.files.read(entry.path));
        if (guardedHash !== currentHash) {
          incomplete.push(entry.path);
          continue;
        }
        await this.files.write(entry.path, beforeText);
        if (await sha256(await this.files.read(entry.path)) !== entry.beforeHash) throw new Error("Restored hash does not match snapshot.");
        entry.rollbackRestored = true;
        await this.snapshots.save(manifest);
      } catch (error) {
        incomplete.push(entry.path);
        manifest.errors.push({ stage: "ROLLING_BACK", path: entry.path, message: error instanceof Error ? error.message : "Unknown rollback error" });
      }
    }
    const state = incomplete.length === 0 ? "ROLLED_BACK" : "ROLLBACK_INCOMPLETE";
    await this.snapshots.updateState(manifest, state);
    hooks.onState?.(state);
    return resultFrom(manifest, state, incomplete);
  }
};
function resultFrom(manifest, state, incomplete = []) {
  return { transactionId: manifest.transactionId, state, errors: manifest.errors, modifiedPaths: manifest.entries.filter((entry) => entry.written).map((entry) => entry.path), rollbackIncompletePaths: incomplete };
}

// src/transaction/restore-plan.ts
async function buildRestorePlan(files, snapshots, manifest) {
  if (manifest.state !== "COMPLETED") throw new Error("Only completed transactions can be undone.");
  const fileChanges = [];
  const divergedPaths = [];
  const missingPaths = [];
  for (const entry of manifest.entries) {
    if (!await files.exists(entry.path)) {
      missingPaths.push(entry.path);
      continue;
    }
    const current = await files.read(entry.path);
    if (await sha256(current) !== entry.afterHash) {
      divergedPaths.push(entry.path);
      continue;
    }
    const before = await snapshots.readSnapshot(manifest.transactionId, entry);
    fileChanges.push({
      path: entry.path,
      kind: entry.path.endsWith(".base") ? "base" : "markdown",
      beforeHash: entry.afterHash,
      beforeText: current,
      afterText: before,
      afterHash: entry.beforeHash,
      operations: [{ kind: entry.path.endsWith(".base") ? "base-property-config" : "frontmatter-key", structuralPath: [], before: manifest.request.newName, after: manifest.request.oldName, reason: `Restore transaction ${manifest.transactionId}` }],
      validation: { valid: true, warnings: [], blockers: [] }
    });
  }
  fileChanges.sort((a, b) => a.path.localeCompare(b.path));
  const seed = { restoreOf: manifest.transactionId, changes: fileChanges.map(({ path, beforeHash, afterHash }) => ({ path, beforeHash, afterHash })) };
  const planId = (await sha256(stableStringify(seed))).slice(0, 24);
  const sourceSnapshots = Object.fromEntries(fileChanges.map((change) => [change.path, { contentHash: change.beforeHash, mtime: 0, size: change.beforeText.length }]));
  const plan = {
    schemaVersion: 1,
    planId,
    inventoryRevision: planId,
    adapterVersion: "restore-v1",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    request: { oldName: manifest.request.newName, newName: manifest.request.oldName, defaultConflictDecision: "block", excludedPaths: [...divergedPaths, ...missingPaths].sort() },
    sourceSnapshots,
    fileChanges,
    unresolvedFindings: [],
    exclusions: [...divergedPaths, ...missingPaths].sort().map((path) => ({ path, remainingReferences: 1 })),
    status: fileChanges.length > 0 ? "ready" : "draft"
  };
  return { plan, divergedPaths, missingPaths };
}

// src/transaction/snapshot-store.ts
var SnapshotStore = class {
  constructor(adapter, root) {
    this.adapter = adapter;
    this.root = root;
  }
  transactionPath(transactionId) {
    if (!/^[a-f0-9-]+$/i.test(transactionId)) throw new Error("Invalid transaction ID.");
    return `${this.root}/${transactionId}`;
  }
  async ensureDirectory(path) {
    const parts = path.split("/").filter(Boolean);
    let current = path.startsWith("/") ? "/" : "";
    for (const part of parts) {
      current = current === "" || current === "/" ? `${current}${part}` : `${current}/${part}`;
      if (!await this.adapter.exists(current)) await this.adapter.mkdir(current);
    }
  }
  async create(transactionId, plan) {
    const directory = this.transactionPath(transactionId);
    await this.ensureDirectory(`${directory}/files`);
    const entries = await Promise.all(plan.fileChanges.map(async (change) => ({
      path: change.path,
      snapshotFile: `${await sha256(change.path)}.txt`,
      beforeHash: change.beforeHash,
      afterHash: change.afterHash,
      byteLength: new TextEncoder().encode(change.beforeText).length,
      snapshotted: false,
      written: false,
      rollbackRestored: false
    })));
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const manifest = { schemaVersion: 1, transactionId, planId: plan.planId, createdAt: now, updatedAt: now, state: "SNAPSHOTTING", request: plan.request, entries, verified: [], errors: [] };
    await this.save(manifest);
    for (let index = 0; index < plan.fileChanges.length; index += 1) {
      const change = plan.fileChanges[index];
      const entry = entries[index];
      if (!change || !entry) continue;
      try {
        await this.adapter.write(`${directory}/files/${entry.snapshotFile}`, change.beforeText);
        if (await sha256(await this.adapter.read(`${directory}/files/${entry.snapshotFile}`)) !== change.beforeHash) throw new Error(`Snapshot verification failed: ${change.path}`);
        entry.snapshotted = true;
        await this.save(manifest);
      } catch (error) {
        manifest.errors.push({ stage: "SNAPSHOTTING", message: error instanceof Error ? error.message : "Unknown snapshot error", path: change.path });
        await this.save(manifest);
        return manifest;
      }
    }
    return manifest;
  }
  async save(manifest) {
    const directory = this.transactionPath(manifest.transactionId);
    await this.ensureDirectory(directory);
    const next = { ...manifest, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    const temporary = `${directory}/manifest.tmp.json`;
    const target = `${directory}/manifest.json`;
    const serialized = `${JSON.stringify(next, null, 2)}
`;
    await this.adapter.write(temporary, serialized);
    const verified = JSON.parse(await this.adapter.read(temporary));
    if (verified.transactionId !== manifest.transactionId) throw new Error("Snapshot manifest verification failed.");
    await this.adapter.write(target, serialized);
    const persisted = JSON.parse(await this.adapter.read(target));
    if (persisted.transactionId !== manifest.transactionId) throw new Error("Persisted manifest verification failed.");
    if (await this.adapter.exists(temporary)) await this.adapter.remove(temporary);
  }
  async load(transactionId) {
    const directory = this.transactionPath(transactionId);
    const candidates = [];
    for (const path of [`${directory}/manifest.json`, `${directory}/manifest.tmp.json`]) {
      if (!await this.adapter.exists(path)) continue;
      try {
        const raw = JSON.parse(await this.adapter.read(path));
        if (isManifest(raw) && raw.transactionId === transactionId) candidates.push(raw);
      } catch {
      }
    }
    const latest = candidates.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (!latest) throw new Error("Invalid snapshot manifest.");
    return latest;
  }
  async readSnapshot(transactionId, entry) {
    if (!/^[a-f0-9]{64}\.txt$/i.test(entry.snapshotFile)) throw new Error("Invalid snapshot filename.");
    const text = await this.adapter.read(`${this.transactionPath(transactionId)}/files/${entry.snapshotFile}`);
    if (await sha256(text) !== entry.beforeHash) throw new Error(`Snapshot hash mismatch: ${entry.path}`);
    return text;
  }
  async list() {
    if (!await this.adapter.exists(this.root)) return [];
    const listing = await this.adapter.list(this.root);
    const manifests = [];
    for (const folder of listing.folders) {
      const id = folder.split("/").at(-1);
      if (!id || !/^[a-f0-9-]+$/i.test(id)) continue;
      try {
        manifests.push(await this.load(id));
      } catch {
      }
    }
    return manifests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async prune(retention) {
    const manifests = await this.list();
    const cleanable = manifests.filter((manifest) => ["COMPLETED", "ROLLED_BACK", "CANCELLED"].includes(manifest.state));
    for (const manifest of cleanable.slice(Math.max(1, retention))) {
      const directory = this.transactionPath(manifest.transactionId);
      for (const entry of manifest.entries) {
        const file = `${directory}/files/${entry.snapshotFile}`;
        if (await this.adapter.exists(file)) await this.adapter.remove(file);
      }
      for (const file of [`${directory}/manifest.json`, `${directory}/manifest.tmp.json`]) if (await this.adapter.exists(file)) await this.adapter.remove(file);
      const filesDirectory = `${directory}/files`;
      if (await this.adapter.exists(filesDirectory)) await this.adapter.rmdir(filesDirectory, false);
      if (await this.adapter.exists(directory)) await this.adapter.rmdir(directory, false);
    }
  }
  async updateState(manifest, state) {
    manifest.state = state;
    await this.save(manifest);
  }
};
function isManifest(value) {
  if (value === null || typeof value !== "object") return false;
  const item = value;
  return item.schemaVersion === 1 && typeof item.transactionId === "string" && Array.isArray(item.entries) && typeof item.state === "string";
}

// src/transaction/vault-file-store.ts
var import_obsidian = require("obsidian");
var VaultFileStore = class {
  constructor(vault) {
    this.vault = vault;
  }
  async read(path) {
    const file = this.resolve(path);
    return this.vault.read(file);
  }
  async write(path, text) {
    const file = this.resolve(path);
    await this.vault.modify(file, text);
  }
  exists(path) {
    return Promise.resolve(this.vault.getAbstractFileByPath(path) instanceof import_obsidian.TFile);
  }
  resolve(path) {
    const file = this.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian.TFile) || file.path !== path) throw new Error(`Vault file is missing: ${path}`);
    return file;
  }
};

// src/app/settings-runtime.ts
function resolveScanConcurrency(isMobile, lowResourceMode) {
  return isMobile || lowResourceMode ? 2 : 8;
}

// src/app/schema-refactor-service.ts
var SchemaRefactorService = class {
  constructor(app, pluginId, getSettings) {
    this.app = app;
    this.getSettings = getSettings;
    this.fileStore = new VaultFileStore(app.vault);
    this.snapshotStore = new SnapshotStore(app.vault.adapter, `${app.vault.configDir}/plugins/${pluginId}/snapshots`);
    this.executor = new TransactionExecutor(this.fileStore, this.snapshotStore);
  }
  snapshotStore;
  fileStore;
  executor;
  inventory;
  findings = [];
  plan;
  get canWrite() {
    return !import_obsidian2.Platform.isMobile;
  }
  async scan(onProgress, signal) {
    this.inventory = await new VaultInventory(this.app.vault).scan({
      ...onProgress ? { onProgress } : {},
      ...signal ? { signal } : {},
      concurrency: resolveScanConcurrency(import_obsidian2.Platform.isMobile, this.getSettings().lowResourceMode)
    });
    return this.inventory;
  }
  async doctor(onProgress, signal) {
    const inventory = await this.scan(onProgress, signal);
    this.findings = await runDoctor(inventory);
    return this.findings;
  }
  async createPlan(request) {
    const inventory = this.inventory ?? await this.scan();
    this.plan = await buildRenamePlan(inventory, request, (/* @__PURE__ */ new Date()).toISOString(), async (path) => {
      const file = this.app.vault.getFileByPath(path);
      if (!file) throw new Error(`Vault file is missing: ${path}`);
      return this.app.vault.cachedRead(file);
    }, this.getSettings().showTextMatches);
    return this.plan;
  }
  async apply(plan, hooks = {}) {
    if (!this.canWrite) throw new Error("Applying changes is disabled on mobile in this release.");
    const freshness = await checkPlanFreshness(this.app.vault, plan);
    if (!freshness.fresh) throw new Error(`Plan is stale. Rescan before applying. ${[...freshness.changedPaths, ...freshness.missingPaths, ...freshness.newCandidatePaths].join(", ")}`);
    const result = await this.executor.execute(plan, hooks);
    this.inventory = void 0;
    this.plan = void 0;
    return result;
  }
  async history() {
    return this.snapshotStore.list();
  }
  async pruneHistory(retention) {
    await this.snapshotStore.prune(retention);
  }
  async createRestorePlan(manifest) {
    const result = await buildRestorePlan(this.fileStore, this.snapshotStore, manifest);
    this.plan = result.plan;
    return result;
  }
  async recoverIncomplete() {
    const results = [];
    for (const manifest of await this.history()) {
      const result = await this.executor.recover(manifest);
      if (result) results.push(result);
    }
    return results;
  }
  async recoverTransaction(manifest) {
    return this.executor.recover(manifest);
  }
};

// src/i18n/en.ts
var en = {
  appName: "Schema Refactor",
  openApp: "Open Schema Refactor",
  runDoctorCommand: "Run read-only Doctor scan",
  headerTagline: "Review every property definition and Base reference before anything changes.",
  language: "Language",
  english: "English",
  simplifiedChinese: "Simplified Chinese",
  replace: "Replace",
  doctor: "Doctor",
  propertyRename: "Property rename",
  oldProperty: "Old property",
  oldPropertyHint: "Property currently used in the Vault",
  newProperty: "New property",
  newPropertyHint: "The target YAML property name",
  conflictPrompt: "When both properties exist",
  conflictHint: "Choose a default; blocked files can be excluded during review",
  conflictBlock: "Block and review",
  conflictKeepTarget: "Keep target value",
  conflictKeepSource: "Keep source value",
  conflictMergeLists: "Merge lists only",
  scope: "Scope",
  scopeHint: "Property references are global, so plans always cover the whole Vault",
  entireVault: "Entire Vault",
  rescanVault: "Rescan Vault",
  scanVault: "Scan Vault",
  cancelScan: "Cancel scan",
  scanProgress: "{processed} / {total} files \xB7 {references} exact references",
  refactorProgress: "Refactor progress",
  stepConfigure: "Configure",
  stepScan: "Scan",
  stepReview: "Review",
  stepConfirm: "Confirm",
  stepApply: "Apply",
  stepVerify: "Verify",
  review: "Review",
  markdownFiles: "Markdown files",
  baseFiles: "Base files",
  exactChanges: "Exact changes",
  blockers: "Blockers",
  planCannotApply: "Plan cannot be applied",
  request: "Request",
  resolveConflict: "Resolve conflict in {path}",
  chooseAction: "Choose action...",
  keepTarget: "Keep target",
  keepSource: "Keep source",
  mergeLists: "Merge lists",
  excludeFile: "Exclude file",
  manualReview: "Manual review \xB7 {count}",
  includeFilePath: "Include {path}",
  changesCount: "{count} changes \xB7 +{additions} \u2212{deletions}",
  openSourceFile: "Open source file",
  frontmatter: "Frontmatter",
  diffFor: "Diff for {path}",
  oldReferencesRemain: "{count} old definitions or references remain",
  includeFile: "Include file",
  exclusionsSummary: "{files} excluded files leave {references} old definitions or references.",
  reviewAndApply: "Review and apply",
  mobileWritesDisabled: "Apply, rollback, and undo are disabled on mobile in this release.",
  vaultHealth: "Vault health",
  vaultHealthHint: "Read-only checks for broken Base references and schema drift.",
  runDoctor: "Run Doctor",
  exportMarkdown: "Export Markdown",
  exportJson: "Export JSON",
  doctorProgress: "{processed} / {total} files checked",
  history: "History",
  refreshHistory: "Refresh history",
  historyEmpty: "Completed and interrupted transactions will appear here.",
  transactionSummary: "{state} \xB7 {count} files \xB7 {date}",
  createUndoPlan: "Create undo plan",
  recoverTransaction: "Safely restore interrupted transaction",
  restoreFiles: "Restore files",
  noFindings: "No findings in the current scan.",
  doctorEmpty: "Run Doctor to inspect Bases and property definitions.",
  errors: "Errors",
  warnings: "Warnings",
  information: "Information",
  createRefactorPlan: "Create refactor plan",
  openFile: "Open file",
  vault: "Vault",
  enterPropertyNames: "Enter both property names before scanning.",
  scanCancelled: "Scan cancelled. No files were changed.",
  scanFailed: "Scan failed.",
  preparingTransaction: "Preparing transaction...",
  completedFiles: "Completed and verified {count} files.",
  applyRolledBack: "Apply failed. All changed files were restored.",
  rollbackIncomplete: "Rollback incomplete: {paths}. Snapshots were retained.",
  applyFailed: "Apply failed.",
  undoExcludesFiles: "Undo plan excludes changed or missing files: {paths}.",
  undoReady: "Undo plan is ready for review.",
  undoFailed: "Could not create undo plan.",
  recoverConfirm: "Restore files written by interrupted transaction {id}? Files changed externally will not be overwritten.",
  checkingRecovery: "Checking interrupted transaction...",
  recoveryComplete: "Interrupted transaction was safely restored.",
  recoveryIncomplete: "Recovery incomplete: {paths}. Snapshots were retained.",
  recoveryNotRequired: "This transaction no longer requires recovery.",
  recoveryFailed: "Recovery failed.",
  doctorCancelled: "Doctor scan cancelled.",
  doctorFailed: "Doctor scan failed.",
  reportCreated: "Created {path}",
  fileNotFound: "File not found: {path}",
  doctorFound: "Schema Refactor Doctor found {count} items.",
  interruptedTransactions: "{count} interrupted Schema Refactor transactions need review. No recovery writes have started.",
  interruptedTransaction: "1 interrupted Schema Refactor transaction needs review. No recovery writes have started.",
  confirmTitle: "Apply reviewed changes?",
  filesWillChange: "{count} files will change",
  excludedAndRetained: "{files} files excluded; {references} old definitions or references will remain",
  conflictPolicy: "Conflict policy: {policy}",
  snapshotFirst: "A local snapshot will be created first",
  externalEditWarning: "Do not edit these files externally until verification finishes.",
  cancel: "Cancel",
  applyChanges: "Apply changes",
  transactionFinished: "Transaction finished",
  applyingChanges: "Applying reviewed changes",
  keepObsidianOpen: "Keep Obsidian open. This window will remain until verification or rollback finishes.",
  close: "Close",
  statePreparing: "preparing transaction",
  stateSnapshotting: "creating snapshots",
  stateWriting: "writing files",
  stateVerifying: "verifying changes",
  stateCompleted: "completed",
  stateRollingBack: "rolling back",
  stateRolledBack: "rolled back",
  stateRollbackIncomplete: "rollback incomplete",
  stateCancelled: "cancelled",
  policyDefaultOverrides: "{defaultPolicy} by default; per-file overrides: {overrides}",
  policyOverrideCount: "{policy} ({count})",
  findingUnparseableBase: "This Base could not be parsed.",
  findingUnknownShape: "This configuration shape is not understood and was left untouched.",
  findingMissingProperty: "Property '{name}' has no instances in the Vault.",
  findingMissingFormula: "Formula '{name}' is referenced but not defined.",
  findingUnusedFormula: "Formula '{name}' is defined but not reachable from a known view or filter.",
  findingCaseDrift: "Properties differ only by case: {evidence}.",
  findingTypeDrift: "A property has incompatible value types: {evidence}.",
  findingInvalidRequest: "The rename request is invalid.",
  findingSourceNotLoaded: "The source file must be reread before planning.",
  findingStaleSource: "The source file changed after the inventory scan. Rescan before planning.",
  findingConflict: "Both source and target properties exist. Choose a conflict action.",
  findingLowConfidence: "An uncertain reference requires manual review and will not be changed.",
  findingRiskyUnknownShape: "An unknown node in a known reference field may contain the old property.",
  findingPlanValidation: "The planned output did not pass validation.",
  findingEmptyPlan: "No old property definitions or references were found.",
  snapshotRetention: "Snapshot retention",
  snapshotRetentionHint: "Number of completed transactions to retain. Incomplete rollbacks are never cleaned automatically.",
  scanAfterStartup: "Scan after startup",
  scanAfterStartupHint: "Run a delayed, read-only Doctor scan when Obsidian starts.",
  showTextMatches: "Show text matches",
  showTextMatchesHint: "Include low-confidence text matches in scan results. They are never changed automatically.",
  lowResourceMode: "Low resource mode",
  lowResourceModeHint: "Use lower scan concurrency on large or resource-constrained devices.",
  includeTypeStats: "Include type statistics in JSON reports",
  includeTypeStatsHint: "Reports include only type names, never property values.",
  snapshotPrivacy: "Snapshots are stored under {path}. Schema Refactor does not send Vault data over the network.",
  privacy: "Privacy",
  repository: "Code repository"
};

// src/i18n/zh-cn.ts
var zhCN = {
  appName: "Schema Refactor",
  openApp: "\u6253\u5F00 Schema Refactor",
  runDoctorCommand: "\u8FD0\u884C\u53EA\u8BFB Doctor \u626B\u63CF",
  headerTagline: "\u4FEE\u6539\u524D\u5BA1\u67E5\u6BCF\u4E2A\u5C5E\u6027\u5B9A\u4E49\u548C Base \u5F15\u7528\u3002",
  language: "\u8BED\u8A00",
  english: "\u82F1\u8BED",
  simplifiedChinese: "\u7B80\u4F53\u4E2D\u6587",
  replace: "\u66FF\u6362",
  doctor: "\u8BCA\u65AD",
  propertyRename: "\u5C5E\u6027\u91CD\u547D\u540D",
  oldProperty: "\u539F\u5C5E\u6027",
  oldPropertyHint: "Vault \u4E2D\u5F53\u524D\u4F7F\u7528\u7684\u5C5E\u6027",
  newProperty: "\u65B0\u5C5E\u6027",
  newPropertyHint: "\u76EE\u6807 YAML \u5C5E\u6027\u540D",
  conflictPrompt: "\u4E24\u4E2A\u5C5E\u6027\u540C\u65F6\u5B58\u5728\u65F6",
  conflictHint: "\u9009\u62E9\u9ED8\u8BA4\u7B56\u7565\uFF1B\u53EF\u5728\u5BA1\u67E5\u65F6\u6392\u9664\u88AB\u963B\u65AD\u7684\u6587\u4EF6",
  conflictBlock: "\u963B\u65AD\u5E76\u5BA1\u67E5",
  conflictKeepTarget: "\u4FDD\u7559\u76EE\u6807\u503C",
  conflictKeepSource: "\u4FDD\u7559\u6765\u6E90\u503C",
  conflictMergeLists: "\u4EC5\u5408\u5E76\u5217\u8868",
  scope: "\u8303\u56F4",
  scopeHint: "\u5C5E\u6027\u5F15\u7528\u662F\u5168\u5C40\u7684\uFF0C\u56E0\u6B64\u8BA1\u5212\u59CB\u7EC8\u8986\u76D6\u6574\u4E2A Vault",
  entireVault: "\u6574\u4E2A Vault",
  rescanVault: "\u91CD\u65B0\u626B\u63CF Vault",
  scanVault: "\u626B\u63CF Vault",
  cancelScan: "\u53D6\u6D88\u626B\u63CF",
  scanProgress: "{processed} / {total} \u4E2A\u6587\u4EF6 \xB7 {references} \u4E2A\u786E\u5B9A\u5F15\u7528",
  refactorProgress: "\u91CD\u6784\u8FDB\u5EA6",
  stepConfigure: "\u914D\u7F6E",
  stepScan: "\u626B\u63CF",
  stepReview: "\u5BA1\u67E5",
  stepConfirm: "\u786E\u8BA4",
  stepApply: "\u5E94\u7528",
  stepVerify: "\u9A8C\u8BC1",
  review: "\u5BA1\u67E5",
  markdownFiles: "Markdown \u6587\u4EF6",
  baseFiles: "Base \u6587\u4EF6",
  exactChanges: "\u786E\u5B9A\u4FEE\u6539",
  blockers: "\u963B\u65AD\u9879",
  planCannotApply: "\u8BA1\u5212\u65E0\u6CD5\u5E94\u7528",
  request: "\u8BF7\u6C42",
  resolveConflict: "\u89E3\u51B3 {path} \u4E2D\u7684\u51B2\u7A81",
  chooseAction: "\u9009\u62E9\u64CD\u4F5C...",
  keepTarget: "\u4FDD\u7559\u76EE\u6807",
  keepSource: "\u4FDD\u7559\u6765\u6E90",
  mergeLists: "\u5408\u5E76\u5217\u8868",
  excludeFile: "\u6392\u9664\u6587\u4EF6",
  manualReview: "\u4EBA\u5DE5\u5BA1\u67E5 \xB7 {count}",
  includeFilePath: "\u5305\u542B {path}",
  changesCount: "{count} \u5904\u4FEE\u6539 \xB7 +{additions} \u2212{deletions}",
  openSourceFile: "\u6253\u5F00\u6E90\u6587\u4EF6",
  frontmatter: "Frontmatter",
  diffFor: "{path} \u7684\u5DEE\u5F02",
  oldReferencesRemain: "\u4ECD\u4FDD\u7559 {count} \u4E2A\u65E7\u5B9A\u4E49\u6216\u5F15\u7528",
  includeFile: "\u5305\u542B\u6587\u4EF6",
  exclusionsSummary: "\u5DF2\u6392\u9664 {files} \u4E2A\u6587\u4EF6\uFF0C\u4FDD\u7559 {references} \u4E2A\u65E7\u5B9A\u4E49\u6216\u5F15\u7528\u3002",
  reviewAndApply: "\u5BA1\u67E5\u5E76\u5E94\u7528",
  mobileWritesDisabled: "\u6B64\u7248\u672C\u5728\u79FB\u52A8\u7AEF\u7981\u7528\u5E94\u7528\u3001\u56DE\u6EDA\u548C\u64A4\u9500\u3002",
  vaultHealth: "Vault \u5065\u5EB7\u68C0\u67E5",
  vaultHealthHint: "\u53EA\u8BFB\u68C0\u67E5\u5931\u6548\u7684 Base \u5F15\u7528\u548C schema \u6F02\u79FB\u3002",
  runDoctor: "\u8FD0\u884C\u8BCA\u65AD",
  exportMarkdown: "\u5BFC\u51FA Markdown",
  exportJson: "\u5BFC\u51FA JSON",
  doctorProgress: "\u5DF2\u68C0\u67E5 {processed} / {total} \u4E2A\u6587\u4EF6",
  history: "\u5386\u53F2\u8BB0\u5F55",
  refreshHistory: "\u5237\u65B0\u5386\u53F2\u8BB0\u5F55",
  historyEmpty: "\u5DF2\u5B8C\u6210\u548C\u4E2D\u65AD\u7684\u4E8B\u52A1\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\u3002",
  transactionSummary: "{state} \xB7 {count} \u4E2A\u6587\u4EF6 \xB7 {date}",
  createUndoPlan: "\u521B\u5EFA\u64A4\u9500\u8BA1\u5212",
  recoverTransaction: "\u5B89\u5168\u6062\u590D\u4E2D\u65AD\u7684\u4E8B\u52A1",
  restoreFiles: "\u6062\u590D\u6587\u4EF6",
  noFindings: "\u5F53\u524D\u626B\u63CF\u6CA1\u6709\u53D1\u73B0\u95EE\u9898\u3002",
  doctorEmpty: "\u8FD0\u884C\u8BCA\u65AD\u4EE5\u68C0\u67E5 Bases \u548C\u5C5E\u6027\u5B9A\u4E49\u3002",
  errors: "\u9519\u8BEF",
  warnings: "\u8B66\u544A",
  information: "\u4FE1\u606F",
  createRefactorPlan: "\u521B\u5EFA\u91CD\u6784\u8BA1\u5212",
  openFile: "\u6253\u5F00\u6587\u4EF6",
  vault: "Vault",
  enterPropertyNames: "\u626B\u63CF\u524D\u8BF7\u8F93\u5165\u539F\u5C5E\u6027\u540D\u548C\u65B0\u5C5E\u6027\u540D\u3002",
  scanCancelled: "\u626B\u63CF\u5DF2\u53D6\u6D88\uFF0C\u672A\u4FEE\u6539\u4EFB\u4F55\u6587\u4EF6\u3002",
  scanFailed: "\u626B\u63CF\u5931\u8D25\u3002",
  preparingTransaction: "\u6B63\u5728\u51C6\u5907\u4E8B\u52A1...",
  completedFiles: "\u5DF2\u5B8C\u6210\u5E76\u9A8C\u8BC1 {count} \u4E2A\u6587\u4EF6\u3002",
  applyRolledBack: "\u5E94\u7528\u5931\u8D25\uFF0C\u6240\u6709\u5DF2\u4FEE\u6539\u6587\u4EF6\u5747\u5DF2\u6062\u590D\u3002",
  rollbackIncomplete: "\u56DE\u6EDA\u672A\u5B8C\u6210\uFF1A{paths}\u3002\u5FEB\u7167\u5DF2\u4FDD\u7559\u3002",
  applyFailed: "\u5E94\u7528\u5931\u8D25\u3002",
  undoExcludesFiles: "\u64A4\u9500\u8BA1\u5212\u5DF2\u6392\u9664\u53D1\u751F\u53D8\u5316\u6216\u7F3A\u5931\u7684\u6587\u4EF6\uFF1A{paths}\u3002",
  undoReady: "\u64A4\u9500\u8BA1\u5212\u5DF2\u51C6\u5907\u597D\uFF0C\u53EF\u5F00\u59CB\u5BA1\u67E5\u3002",
  undoFailed: "\u65E0\u6CD5\u521B\u5EFA\u64A4\u9500\u8BA1\u5212\u3002",
  recoverConfirm: "\u8981\u6062\u590D\u4E2D\u65AD\u4E8B\u52A1 {id} \u5199\u5165\u7684\u6587\u4EF6\u5417\uFF1F\u5916\u90E8\u4FEE\u6539\u8FC7\u7684\u6587\u4EF6\u4E0D\u4F1A\u88AB\u8986\u76D6\u3002",
  checkingRecovery: "\u6B63\u5728\u68C0\u67E5\u4E2D\u65AD\u7684\u4E8B\u52A1...",
  recoveryComplete: "\u4E2D\u65AD\u7684\u4E8B\u52A1\u5DF2\u5B89\u5168\u6062\u590D\u3002",
  recoveryIncomplete: "\u6062\u590D\u672A\u5B8C\u6210\uFF1A{paths}\u3002\u5FEB\u7167\u5DF2\u4FDD\u7559\u3002",
  recoveryNotRequired: "\u6B64\u4E8B\u52A1\u4E0D\u518D\u9700\u8981\u6062\u590D\u3002",
  recoveryFailed: "\u6062\u590D\u5931\u8D25\u3002",
  doctorCancelled: "\u8BCA\u65AD\u626B\u63CF\u5DF2\u53D6\u6D88\u3002",
  doctorFailed: "\u8BCA\u65AD\u626B\u63CF\u5931\u8D25\u3002",
  reportCreated: "\u5DF2\u521B\u5EFA {path}",
  fileNotFound: "\u627E\u4E0D\u5230\u6587\u4EF6\uFF1A{path}",
  doctorFound: "Schema Refactor Doctor \u53D1\u73B0 {count} \u9879\u95EE\u9898\u3002",
  interruptedTransactions: "\u6709 {count} \u4E2A\u4E2D\u65AD\u7684 Schema Refactor \u4E8B\u52A1\u9700\u8981\u5BA1\u67E5\uFF0C\u5C1A\u672A\u5F00\u59CB\u6062\u590D\u5199\u5165\u3002",
  interruptedTransaction: "\u6709 1 \u4E2A\u4E2D\u65AD\u7684 Schema Refactor \u4E8B\u52A1\u9700\u8981\u5BA1\u67E5\uFF0C\u5C1A\u672A\u5F00\u59CB\u6062\u590D\u5199\u5165\u3002",
  confirmTitle: "\u5E94\u7528\u5DF2\u5BA1\u67E5\u7684\u4FEE\u6539\uFF1F",
  filesWillChange: "\u5C06\u4FEE\u6539 {count} \u4E2A\u6587\u4EF6",
  excludedAndRetained: "\u5DF2\u6392\u9664 {files} \u4E2A\u6587\u4EF6\uFF1B\u5C06\u4FDD\u7559 {references} \u4E2A\u65E7\u5B9A\u4E49\u6216\u5F15\u7528",
  conflictPolicy: "\u51B2\u7A81\u7B56\u7565\uFF1A{policy}",
  snapshotFirst: "\u5C06\u5148\u521B\u5EFA\u672C\u5730\u5FEB\u7167",
  externalEditWarning: "\u9A8C\u8BC1\u5B8C\u6210\u524D\uFF0C\u8BF7\u52FF\u5728\u5916\u90E8\u7F16\u8F91\u8FD9\u4E9B\u6587\u4EF6\u3002",
  cancel: "\u53D6\u6D88",
  applyChanges: "\u5E94\u7528\u4FEE\u6539",
  transactionFinished: "\u4E8B\u52A1\u5DF2\u7ED3\u675F",
  applyingChanges: "\u6B63\u5728\u5E94\u7528\u5DF2\u5BA1\u67E5\u7684\u4FEE\u6539",
  keepObsidianOpen: "\u8BF7\u4FDD\u6301 Obsidian \u6253\u5F00\u3002\u6B64\u7A97\u53E3\u4F1A\u6301\u7EED\u663E\u793A\u5230\u9A8C\u8BC1\u6216\u56DE\u6EDA\u5B8C\u6210\u3002",
  close: "\u5173\u95ED",
  statePreparing: "\u6B63\u5728\u51C6\u5907\u4E8B\u52A1",
  stateSnapshotting: "\u6B63\u5728\u521B\u5EFA\u5FEB\u7167",
  stateWriting: "\u6B63\u5728\u5199\u5165\u6587\u4EF6",
  stateVerifying: "\u6B63\u5728\u9A8C\u8BC1\u4FEE\u6539",
  stateCompleted: "\u5DF2\u5B8C\u6210",
  stateRollingBack: "\u6B63\u5728\u56DE\u6EDA",
  stateRolledBack: "\u5DF2\u56DE\u6EDA",
  stateRollbackIncomplete: "\u56DE\u6EDA\u672A\u5B8C\u6210",
  stateCancelled: "\u5DF2\u53D6\u6D88",
  policyDefaultOverrides: "\u9ED8\u8BA4{defaultPolicy}\uFF1B\u9010\u6587\u4EF6\u8986\u76D6\uFF1A{overrides}",
  policyOverrideCount: "{policy}\uFF08{count}\uFF09",
  findingUnparseableBase: "\u6B64 Base \u65E0\u6CD5\u89E3\u6790\u3002",
  findingUnknownShape: "\u65E0\u6CD5\u8BC6\u522B\u6B64\u914D\u7F6E\u7ED3\u6784\uFF0C\u5DF2\u4FDD\u6301\u539F\u6837\u3002",
  findingMissingProperty: "Vault \u4E2D\u6CA1\u6709\u5C5E\u6027\u201C{name}\u201D\u7684\u5B9E\u4F8B\u3002",
  findingMissingFormula: "\u516C\u5F0F\u201C{name}\u201D\u88AB\u5F15\u7528\u4F46\u672A\u5B9A\u4E49\u3002",
  findingUnusedFormula: "\u516C\u5F0F\u201C{name}\u201D\u65E0\u6CD5\u4ECE\u5DF2\u77E5\u89C6\u56FE\u6216\u8FC7\u6EE4\u5668\u8BBF\u95EE\u3002",
  findingCaseDrift: "\u4EE5\u4E0B\u5C5E\u6027\u4EC5\u5927\u5C0F\u5199\u4E0D\u540C\uFF1A{evidence}\u3002",
  findingTypeDrift: "\u5C5E\u6027\u5B58\u5728\u4E0D\u517C\u5BB9\u7684\u503C\u7C7B\u578B\uFF1A{evidence}\u3002",
  findingInvalidRequest: "\u5C5E\u6027\u91CD\u547D\u540D\u8BF7\u6C42\u65E0\u6548\u3002",
  findingSourceNotLoaded: "\u751F\u6210\u8BA1\u5212\u524D\u5FC5\u987B\u91CD\u65B0\u8BFB\u53D6\u6E90\u6587\u4EF6\u3002",
  findingStaleSource: "\u6E90\u6587\u4EF6\u5728\u5E93\u5B58\u626B\u63CF\u540E\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u626B\u63CF\u3002",
  findingConflict: "\u6765\u6E90\u5C5E\u6027\u548C\u76EE\u6807\u5C5E\u6027\u540C\u65F6\u5B58\u5728\uFF0C\u8BF7\u9009\u62E9\u51B2\u7A81\u5904\u7406\u65B9\u5F0F\u3002",
  findingLowConfidence: "\u4E0D\u786E\u5B9A\u5F15\u7528\u9700\u8981\u4EBA\u5DE5\u5BA1\u67E5\uFF0C\u4E0D\u4F1A\u81EA\u52A8\u4FEE\u6539\u3002",
  findingRiskyUnknownShape: "\u5DF2\u77E5\u5F15\u7528\u5B57\u6BB5\u4E2D\u7684\u672A\u77E5\u8282\u70B9\u53EF\u80FD\u5305\u542B\u539F\u5C5E\u6027\u3002",
  findingPlanValidation: "\u8BA1\u5212\u8F93\u51FA\u672A\u901A\u8FC7\u9A8C\u8BC1\u3002",
  findingEmptyPlan: "\u672A\u627E\u5230\u539F\u5C5E\u6027\u5B9A\u4E49\u6216\u5F15\u7528\u3002",
  snapshotRetention: "\u5FEB\u7167\u4FDD\u7559\u6570\u91CF",
  snapshotRetentionHint: "\u4FDD\u7559\u7684\u5DF2\u5B8C\u6210\u4E8B\u52A1\u6570\u91CF\u3002\u56DE\u6EDA\u672A\u5B8C\u6210\u7684\u4E8B\u52A1\u6C38\u4E0D\u81EA\u52A8\u6E05\u7406\u3002",
  scanAfterStartup: "\u542F\u52A8\u540E\u626B\u63CF",
  scanAfterStartupHint: "Obsidian \u542F\u52A8\u540E\u5EF6\u8FDF\u8FD0\u884C\u4E00\u6B21\u53EA\u8BFB Doctor \u626B\u63CF\u3002",
  showTextMatches: "\u663E\u793A\u6587\u672C\u5339\u914D",
  showTextMatchesHint: "\u5728\u626B\u63CF\u7ED3\u679C\u4E2D\u5305\u542B\u4F4E\u7F6E\u4FE1\u6587\u672C\u5339\u914D\uFF0C\u6C38\u4E0D\u81EA\u52A8\u4FEE\u6539\u5B83\u4EEC\u3002",
  lowResourceMode: "\u4F4E\u8D44\u6E90\u6A21\u5F0F",
  lowResourceModeHint: "\u5728\u5927\u578B Vault \u6216\u8D44\u6E90\u53D7\u9650\u8BBE\u5907\u4E0A\u964D\u4F4E\u626B\u63CF\u5E76\u53D1\u3002",
  includeTypeStats: "\u5728 JSON \u62A5\u544A\u4E2D\u5305\u542B\u7C7B\u578B\u7EDF\u8BA1",
  includeTypeStatsHint: "\u62A5\u544A\u53EA\u5305\u542B\u7C7B\u578B\u540D\u79F0\uFF0C\u6C38\u4E0D\u5305\u542B\u5C5E\u6027\u503C\u3002",
  snapshotPrivacy: "\u5FEB\u7167\u5B58\u50A8\u5728 {path}\u3002Schema Refactor \u4E0D\u4F1A\u901A\u8FC7\u7F51\u7EDC\u53D1\u9001 Vault \u6570\u636E\u3002",
  privacy: "\u9690\u79C1",
  repository: "\u4EE3\u7801\u4ED3\u5E93"
};

// src/i18n/index.ts
var catalogs = { en, "zh-CN": zhCN };
function normalizeLanguage(value) {
  return value === "zh-CN" ? "zh-CN" : "en";
}
function createTranslator(language) {
  return (key, values = {}) => catalogs[language][key].replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
}
function transactionStateLabel(state, t) {
  const keys = {
    PREPARING: "statePreparing",
    SNAPSHOTTING: "stateSnapshotting",
    WRITING: "stateWriting",
    VERIFYING: "stateVerifying",
    COMPLETED: "stateCompleted",
    ROLLING_BACK: "stateRollingBack",
    ROLLED_BACK: "stateRolledBack",
    ROLLBACK_INCOMPLETE: "stateRollbackIncomplete",
    CANCELLED: "stateCancelled"
  };
  return t(keys[state]);
}
function findingMessage(item, t) {
  const evidence2 = item.evidence ?? "";
  switch (item.ruleId) {
    case "UNPARSEABLE_BASE":
      return t("findingUnparseableBase");
    case "UNKNOWN_BASE_SHAPE":
      return t(item.severity === "blocker" ? "findingRiskyUnknownShape" : "findingUnknownShape");
    case "MISSING_PROPERTY":
      return t("findingMissingProperty", { name: item.refactorRequest?.oldName ?? evidence2 });
    case "MISSING_FORMULA":
      return t("findingMissingFormula", { name: evidence2.replace(/^formula\./, "") });
    case "UNUSED_FORMULA":
      return t("findingUnusedFormula", { name: evidence2 });
    case "CASE_DRIFT":
      return t("findingCaseDrift", { evidence: evidence2 });
    case "TYPE_DRIFT":
      return t("findingTypeDrift", { evidence: evidence2 });
    case "INVALID_REQUEST":
      return t("findingInvalidRequest");
    case "SOURCE_NOT_LOADED":
      return t("findingSourceNotLoaded");
    case "STALE_SOURCE":
      return t("findingStaleSource");
    case "MARKDOWN_CONFLICT":
    case "BASE_CONFLICT":
      return item.message;
    case "LOW_CONFIDENCE_REFERENCE":
      return t("findingLowConfidence");
    case "PLAN_VALIDATION":
      return item.message;
    case "EMPTY_PLAN":
      return t("findingEmptyPlan");
    default:
      return item.message;
  }
}

// src/settings.ts
var import_obsidian3 = require("obsidian");
var REPOSITORY_URL = "https://github.com/MMortise/obsidian-vault-schema-refactor";
var DEFAULT_SETTINGS = {
  language: "en",
  snapshotRetention: 20,
  scanOnStartup: false,
  showTextMatches: false,
  lowResourceMode: false,
  includeTypeStats: true
};
var SchemaRefactorSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, schemaPlugin) {
    super(app, schemaPlugin);
    this.schemaPlugin = schemaPlugin;
  }
  getSettingDefinitions() {
    const t = createTranslator(this.schemaPlugin.settings.language);
    return [
      {
        name: t("language"),
        control: { type: "dropdown", key: "language", options: { en: t("english"), "zh-CN": t("simplifiedChinese") } }
      },
      {
        name: t("snapshotRetention"),
        desc: t("snapshotRetentionHint"),
        control: { type: "slider", key: "snapshotRetention", min: 1, max: 100, step: 1, displayFormat: String }
      },
      {
        name: t("scanAfterStartup"),
        desc: t("scanAfterStartupHint"),
        control: { type: "toggle", key: "scanOnStartup" }
      },
      {
        name: t("showTextMatches"),
        desc: t("showTextMatchesHint"),
        control: { type: "toggle", key: "showTextMatches" }
      },
      {
        name: t("lowResourceMode"),
        desc: t("lowResourceModeHint"),
        control: { type: "toggle", key: "lowResourceMode" }
      },
      {
        name: t("includeTypeStats"),
        desc: t("includeTypeStatsHint"),
        control: { type: "toggle", key: "includeTypeStats" }
      },
      {
        name: t("privacy"),
        desc: t("snapshotPrivacy", { path: `${this.app.vault.configDir}/plugins/schema-refactor/snapshots` })
      },
      {
        name: t("repository"),
        render: (setting) => {
          setting.descEl.createEl("a", { text: REPOSITORY_URL, href: REPOSITORY_URL, attr: { target: "_blank", rel: "noopener" } });
        }
      }
    ];
  }
  getControlValue(key) {
    return this.schemaPlugin.settings[key];
  }
  async setControlValue(key, value) {
    if (key === "language") {
      const saved = this.schemaPlugin.setLanguage(normalizeLanguage(value));
      this.update();
      await saved;
      return;
    }
    switch (key) {
      case "snapshotRetention":
        this.schemaPlugin.settings.snapshotRetention = Number(value);
        break;
      case "scanOnStartup":
        this.schemaPlugin.settings.scanOnStartup = Boolean(value);
        break;
      case "showTextMatches":
        this.schemaPlugin.settings.showTextMatches = Boolean(value);
        break;
      case "lowResourceMode":
        this.schemaPlugin.settings.lowResourceMode = Boolean(value);
        break;
      case "includeTypeStats":
        this.schemaPlugin.settings.includeTypeStats = Boolean(value);
        break;
      default:
        return;
    }
    await this.schemaPlugin.saveSettings();
  }
};

// src/ui/main-view.ts
var import_obsidian7 = require("obsidian");

// node_modules/diff/libesm/diff/base.js
var Diff = class {
  diff(oldStr, newStr, options = {}) {
    let callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    } else if ("callback" in options) {
      callback = options.callback;
    }
    const oldString = this.castInput(oldStr, options);
    const newString = this.castInput(newStr, options);
    const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
    const newTokens = this.removeEmpty(this.tokenize(newString, options));
    return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
  }
  diffWithOptionsObj(oldTokens, newTokens, options, callback) {
    var _a;
    const done = (value) => {
      value = this.postProcess(value, options);
      if (callback) {
        setTimeout(function() {
          callback(value);
        }, 0);
        return void 0;
      } else {
        return value;
      }
    };
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    const maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
    const abortAfterTimestamp = Date.now() + maxExecutionTime;
    const bestPath = [{ oldPos: -1, lastComponent: void 0 }];
    let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
    }
    let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
    const execEditLength = () => {
      for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
        let basePath;
        const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = void 0;
        }
        let canAdd = false;
        if (addPath) {
          const addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }
        const canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = void 0;
          continue;
        }
        if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
          basePath = this.addToPath(addPath, true, false, 0, options);
        } else {
          basePath = this.addToPath(removePath, false, true, 1, options);
        }
        newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
          }
        }
      }
      editLength++;
    };
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
            return callback(void 0);
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
        const ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  }
  addToPath(path, added, removed, oldPosInc, options) {
    const last = path.lastComponent;
    if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: last.count + 1, added, removed, previousComponent: last.previousComponent }
      };
    } else {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: 1, added, removed, previousComponent: last }
      };
    }
  }
  extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
      newPos++;
      oldPos++;
      commonCount++;
      if (options.oneChangePerToken) {
        basePath.lastComponent = { count: 1, previousComponent: basePath.lastComponent, added: false, removed: false };
      }
    }
    if (commonCount && !options.oneChangePerToken) {
      basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, added: false, removed: false };
    }
    basePath.oldPos = oldPos;
    return newPos;
  }
  equals(left, right, options) {
    if (options.comparator) {
      return options.comparator(left, right);
    } else {
      return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  }
  removeEmpty(array) {
    const ret = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  castInput(value, options) {
    return value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tokenize(value, options) {
    return Array.from(value);
  }
  join(chars) {
    return chars.join("");
  }
  postProcess(changeObjects, options) {
    return changeObjects;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(lastComponent, newTokens, oldTokens) {
    const components = [];
    let nextComponent;
    while (lastComponent) {
      components.push(lastComponent);
      nextComponent = lastComponent.previousComponent;
      delete lastComponent.previousComponent;
      lastComponent = nextComponent;
    }
    components.reverse();
    const componentLen = components.length;
    let componentPos = 0, newPos = 0, oldPos = 0;
    for (; componentPos < componentLen; componentPos++) {
      const component = components[componentPos];
      if (!component.removed) {
        if (!component.added && this.useLongestToken) {
          let value = newTokens.slice(newPos, newPos + component.count);
          value = value.map(function(value2, i) {
            const oldValue = oldTokens[oldPos + i];
            return oldValue.length > value2.length ? oldValue : value2;
          });
          component.value = this.join(value);
        } else {
          component.value = this.join(newTokens.slice(newPos, newPos + component.count));
        }
        newPos += component.count;
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
        oldPos += component.count;
      }
    }
    return components;
  }
};

// node_modules/diff/libesm/diff/line.js
var LineDiff = class extends Diff {
  constructor() {
    super(...arguments);
    this.tokenize = tokenize;
  }
  equals(left, right, options) {
    if (options.ignoreWhitespace) {
      if (!options.newlineIsToken || !left.includes("\n")) {
        left = left.trim();
      }
      if (!options.newlineIsToken || !right.includes("\n")) {
        right = right.trim();
      }
    } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
      if (left.endsWith("\n")) {
        left = left.slice(0, -1);
      }
      if (right.endsWith("\n")) {
        right = right.slice(0, -1);
      }
    }
    return super.equals(left, right, options);
  }
};
var lineDiff = new LineDiff();
function diffLines(oldStr, newStr, options) {
  return lineDiff.diff(oldStr, newStr, options);
}
function tokenize(value, options) {
  if (options.stripTrailingCr) {
    value = value.replace(/\r\n/g, "\n");
  }
  const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (let i = 0; i < linesAndNewlines.length; i++) {
    const line = linesAndNewlines[i];
    if (i % 2 && !options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      retLines.push(line);
    }
  }
  return retLines;
}

// src/planning/diff-builder.ts
function normalize(changes) {
  return changes.map((change) => ({ value: change.value, added: change.added, removed: change.removed, count: change.count }));
}
function buildLineDiff(change) {
  return normalize(diffLines(change.beforeText, change.afterText));
}
function diffSummary(change) {
  return buildLineDiff(change).reduce((summary, chunk) => ({
    additions: summary.additions + (chunk.added ? chunk.count : 0),
    deletions: summary.deletions + (chunk.removed ? chunk.count : 0)
  }), { additions: 0, deletions: 0 });
}

// src/report/report.ts
function createReport(findings, pluginVersion, generatedAt = (/* @__PURE__ */ new Date()).toISOString(), options = {}) {
  const propertyTypes = options.includeTypeStats && options.propertyTypes ? Object.fromEntries([...options.propertyTypes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, kinds]) => [name, [...kinds].sort()])) : void 0;
  return {
    schemaVersion: 1,
    pluginVersion,
    generatedAt,
    summary: {
      error: findings.filter((item) => item.severity === "error").length,
      warning: findings.filter((item) => item.severity === "warning").length,
      info: findings.filter((item) => item.severity === "info").length
    },
    findings,
    ...propertyTypes ? { propertyTypes } : {}
  };
}
function reportToJson(report) {
  return `${JSON.stringify(report, null, 2)}
`;
}
function escapeMarkdown(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("|", "\\|").replaceAll("`", "\\`").replaceAll("\n", " ");
}
function reportToMarkdown(report) {
  const lines = [
    "# Schema Refactor Doctor Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Errors: ${report.summary.error} | Warnings: ${report.summary.warning} | Info: ${report.summary.info}`,
    "",
    "| Severity | Rule | File | Location | Finding |",
    "|---|---|---|---|---|"
  ];
  for (const item of report.findings) lines.push(`| ${item.severity} | ${item.ruleId} | ${escapeMarkdown(item.filePath || "Vault")} | ${escapeMarkdown(item.structuralPath?.join(" > ") ?? "-")} | ${escapeMarkdown(item.message)} |`);
  return `${lines.join("\n")}
`;
}

// src/ui/confirm-modal.ts
var import_obsidian4 = require("obsidian");

// src/ui/confirmation-summary.ts
function conflictDecisionLabels(t) {
  return { block: t("conflictBlock"), "keep-target": t("conflictKeepTarget"), "keep-source": t("conflictKeepSource"), "merge-lists": t("conflictMergeLists") };
}
function buildConfirmationSummary(plan, t = createTranslator("en")) {
  const labels = conflictDecisionLabels(t);
  const overrideCounts = /* @__PURE__ */ new Map();
  for (const decision of Object.values(plan.request.conflictDecisions ?? {})) {
    overrideCounts.set(decision, (overrideCounts.get(decision) ?? 0) + 1);
  }
  const overrides = Object.entries(labels).flatMap(([decision, label]) => {
    const count = overrideCounts.get(decision);
    return count === void 0 ? [] : [t("policyOverrideCount", { policy: label, count })];
  });
  const defaultPolicy = labels[plan.request.defaultConflictDecision];
  return {
    filesChanging: plan.fileChanges.length,
    excludedFiles: plan.exclusions.length,
    retainedReferences: plan.exclusions.reduce((sum, exclusion) => sum + exclusion.remainingReferences, 0),
    conflictPolicy: overrides.length === 0 ? defaultPolicy : t("policyDefaultOverrides", { defaultPolicy, overrides: overrides.join(", ") })
  };
}

// src/ui/confirm-modal.ts
var ConfirmApplyModal = class extends import_obsidian4.Modal {
  constructor(app, plan, onConfirm, t = createTranslator("en")) {
    super(app);
    this.plan = plan;
    this.onConfirm = onConfirm;
    this.t = t;
  }
  onOpen() {
    const { contentEl } = this;
    const summary = buildConfirmationSummary(this.plan, this.t);
    contentEl.addClass("schema-refactor-confirm");
    this.setTitle(this.t("confirmTitle"));
    const facts = contentEl.createDiv({ cls: "schema-refactor-confirm__facts" });
    facts.createDiv({ text: this.t("filesWillChange", { count: summary.filesChanging }) });
    facts.createDiv({ text: this.t("excludedAndRetained", { files: summary.excludedFiles, references: summary.retainedReferences }) });
    facts.createDiv({ text: this.t("conflictPolicy", { policy: summary.conflictPolicy }) });
    facts.createDiv({ text: this.t("snapshotFirst") });
    contentEl.createEl("p", { text: this.t("externalEditWarning") });
    const actions = contentEl.createDiv({ cls: "modal-button-container" });
    actions.createEl("button", { text: this.t("cancel") }).addEventListener("click", () => this.close());
    const confirm = actions.createEl("button", { cls: "mod-cta" });
    (0, import_obsidian4.setIcon)(confirm, "play");
    confirm.createSpan({ text: this.t("applyChanges") });
    confirm.addEventListener("click", () => {
      this.close();
      this.onConfirm();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/ui/refactor-request-state.ts
var RefactorRequestState = class {
  oldName = "";
  newName = "";
  excludedPaths = /* @__PURE__ */ new Set();
  conflictDecisions = {};
  resultMessage = "";
  reviewedPlan;
  setOldName(value) {
    if (value === this.oldName) return;
    this.oldName = value;
    this.invalidateReview();
  }
  setNewName(value) {
    if (value === this.newName) return;
    this.newName = value;
    this.invalidateReview();
  }
  setReviewedPlan(plan) {
    this.reviewedPlan = plan;
  }
  invalidateReview() {
    this.reviewedPlan = void 0;
    this.excludedPaths.clear();
    this.conflictDecisions = {};
    this.resultMessage = "";
  }
};

// src/ui/apply-progress-modal.ts
var import_obsidian5 = require("obsidian");

// src/ui/apply-progress-state.ts
var TERMINAL_STATES = /* @__PURE__ */ new Set(["COMPLETED", "ROLLED_BACK", "ROLLBACK_INCOMPLETE"]);
var ApplyProgressState = class {
  constructor(t = createTranslator("en")) {
    this.t = t;
    this.message = this.t("statePreparing");
  }
  state = "PREPARING";
  path;
  message;
  terminal = false;
  update(state, path) {
    this.state = state;
    this.path = path;
    this.message = transactionStateLabel(state, this.t);
    this.terminal = TERMINAL_STATES.has(state);
  }
  fail(message) {
    this.message = message;
    this.path = void 0;
    this.terminal = true;
  }
  canClose() {
    return this.terminal;
  }
};

// src/ui/apply-progress-modal.ts
var ApplyProgressModal = class extends import_obsidian5.Modal {
  constructor(app, t = createTranslator("en")) {
    super(app);
    this.t = t;
    this.progress = new ApplyProgressState(t);
  }
  progress;
  onOpen() {
    this.modalEl.addClass("schema-refactor-progress-modal");
    this.render();
  }
  update(state, path) {
    this.progress.update(state, path);
    this.render();
  }
  fail(message) {
    this.progress.fail(message);
    this.render();
  }
  close() {
    if (this.progress.canClose()) super.close();
  }
  render() {
    this.contentEl.empty();
    this.setTitle(this.progress.terminal ? this.t("transactionFinished") : this.t("applyingChanges"));
    const status = this.contentEl.createDiv({ cls: "schema-refactor-progress-modal__status", attr: { role: "status", "aria-live": "polite" } });
    const icon = status.createSpan();
    (0, import_obsidian5.setIcon)(icon, this.progress.terminal ? this.progress.state === "COMPLETED" ? "circle-check" : "circle-alert" : "loader-circle");
    const copy = status.createDiv();
    copy.createEl("strong", { text: this.progress.message });
    if (this.progress.path) copy.createSpan({ text: this.progress.path });
    if (!this.progress.terminal) this.contentEl.createEl("p", { text: this.t("keepObsidianOpen") });
    else {
      const actions = this.contentEl.createDiv({ cls: "modal-button-container" });
      actions.createEl("button", { cls: "mod-cta", text: this.t("close") }).addEventListener("click", () => this.close());
    }
  }
};

// src/ui/recovery-confirm-modal.ts
var import_obsidian6 = require("obsidian");
var RecoveryConfirmModal = class extends import_obsidian6.Modal {
  constructor(app, transactionId, resolve, t = createTranslator("en")) {
    super(app);
    this.transactionId = transactionId;
    this.resolve = resolve;
    this.t = t;
  }
  resolved = false;
  onOpen() {
    this.setTitle(this.t("recoverTransaction"));
    this.contentEl.createEl("p", { text: this.t("recoverConfirm", { id: this.transactionId }) });
    const actions = this.contentEl.createDiv({ cls: "modal-button-container" });
    actions.createEl("button", { text: this.t("cancel") }).addEventListener("click", () => this.finish(false));
    const confirm = actions.createEl("button", { cls: "mod-warning" });
    (0, import_obsidian6.setIcon)(confirm, "rotate-ccw");
    confirm.createSpan({ text: this.t("restoreFiles") });
    confirm.addEventListener("click", () => this.finish(true));
  }
  onClose() {
    this.contentEl.empty();
    if (!this.resolved) this.resolve(false);
  }
  finish(confirmed) {
    this.resolved = true;
    this.resolve(confirmed);
    this.close();
  }
};

// src/ui/main-view.ts
var SCHEMA_REFACTOR_VIEW = "schema-refactor-view";
var SchemaRefactorView = class extends import_obsidian7.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  tab = "refactor";
  requestState = new RefactorRequestState();
  conflictDecision = "block";
  busy = false;
  scanController;
  progress;
  history = [];
  getViewType() {
    return SCHEMA_REFACTOR_VIEW;
  }
  getDisplayText() {
    return this.t("appName");
  }
  getIcon() {
    return "scan-search";
  }
  get t() {
    return createTranslator(this.plugin.settings.language);
  }
  async onOpen() {
    this.history = await this.plugin.service.history();
    this.render();
  }
  refreshLanguage() {
    this.render();
  }
  render() {
    const t = this.t;
    const root = this.contentEl;
    root.empty();
    root.addClass("schema-refactor");
    const header = root.createDiv({ cls: "schema-refactor__header" });
    const identity = header.createDiv();
    identity.createEl("h1", { text: t("appName") });
    identity.createEl("p", { text: t("headerTagline") });
    const tabs = header.createDiv({ cls: "schema-refactor__tabs", attr: { role: "tablist" } });
    this.tabButton(tabs, "refactor", t("replace"), "replace");
    this.tabButton(tabs, "doctor", t("doctor"), "stethoscope");
    const main = root.createDiv({ cls: "schema-refactor__main" });
    if (this.tab === "refactor") this.renderRefactor(main);
    else this.renderDoctor(main);
  }
  tabButton(parent, tab, label, icon) {
    const button = parent.createEl("button", { cls: this.tab === tab ? "is-active" : "", attr: { role: "tab", "aria-selected": String(this.tab === tab) } });
    (0, import_obsidian7.setIcon)(button, icon);
    button.createSpan({ text: label });
    button.addEventListener("click", () => {
      this.tab = tab;
      this.render();
    });
  }
  renderRefactor(root) {
    const t = this.t;
    this.renderSteps(root);
    const configure = root.createDiv({ cls: "schema-refactor__section" });
    configure.createEl("h2", { text: t("propertyRename") });
    const form = configure.createDiv({ cls: "schema-refactor__form" });
    const known = [...this.plugin.service.inventory?.propertyTypes.keys() ?? []].sort();
    const oldField = this.field(form, t("oldProperty"), t("oldPropertyHint"));
    const oldInput = oldField.createEl("input", { type: "text", value: this.requestState.oldName, attr: { list: "schema-refactor-properties", autocomplete: "off" } });
    const dataList = oldField.createEl("datalist", { attr: { id: "schema-refactor-properties" } });
    known.forEach((name) => dataList.createEl("option", { value: name }));
    oldInput.addEventListener("input", () => {
      this.requestState.setOldName(oldInput.value);
      this.invalidateRenderedPlan();
    });
    const newField = this.field(form, t("newProperty"), t("newPropertyHint"));
    const newInput = newField.createEl("input", { type: "text", value: this.requestState.newName });
    newInput.addEventListener("input", () => {
      this.requestState.setNewName(newInput.value);
      this.invalidateRenderedPlan();
    });
    const conflictField = this.field(form, t("conflictPrompt"), t("conflictHint"));
    const select = conflictField.createEl("select");
    const conflictOptions = [["block", t("conflictBlock")], ["keep-target", t("conflictKeepTarget")], ["keep-source", t("conflictKeepSource")], ["merge-lists", t("conflictMergeLists")]];
    conflictOptions.forEach(([value, label]) => select.createEl("option", { value, text: label }));
    select.value = this.conflictDecision;
    select.addEventListener("change", () => {
      this.conflictDecision = select.value;
    });
    const scopeField = this.field(form, t("scope"), t("scopeHint"));
    scopeField.createEl("input", { type: "text", value: t("entireVault"), attr: { disabled: "" } });
    const actions = configure.createDiv({ cls: "schema-refactor__actions" });
    const scan = this.iconButton(actions, this.plugin.service.inventory ? t("rescanVault") : t("scanVault"), "scan-search", true);
    scan.disabled = this.busy;
    scan.addEventListener("click", () => void this.scanAndPlan());
    if (this.busy && this.scanController) {
      const cancel = this.iconButton(actions, t("cancelScan"), "square");
      cancel.addEventListener("click", () => this.scanController?.abort());
    }
    if (this.progress) configure.createEl("p", { cls: "schema-refactor__progress", text: t("scanProgress", { processed: this.progress.processed, total: this.progress.total, references: this.progress.exactReferences }) });
    if (this.plugin.service.plan) this.renderPlan(root, this.plugin.service.plan);
    if (this.requestState.resultMessage) root.createDiv({ cls: "schema-refactor__result", text: this.requestState.resultMessage });
    this.renderHistory(root);
  }
  renderSteps(root) {
    const t = this.t;
    const hasInventory = this.plugin.service.inventory !== void 0;
    const hasPlan = this.plugin.service.plan !== void 0;
    const steps = root.createDiv({ cls: "schema-refactor__steps", attr: { "aria-label": t("refactorProgress") } });
    [t("stepConfigure"), t("stepScan"), t("stepReview"), t("stepConfirm"), t("stepApply"), t("stepVerify")].forEach((label, index) => {
      const complete = index === 0 || index === 1 && hasInventory || index === 2 && hasPlan || index > 2 && this.requestState.resultMessage.length > 0;
      const item = steps.createDiv({ cls: complete ? "is-complete" : "" });
      item.createSpan({ cls: "schema-refactor__step-index", text: String(index + 1) });
      item.createSpan({ text: label });
    });
  }
  renderPlan(root, plan) {
    const t = this.t;
    const section = root.createDiv({ cls: "schema-refactor__section schema-refactor__review" });
    section.createEl("h2", { text: t("review") });
    const stats = section.createDiv({ cls: "schema-refactor__stats" });
    this.stat(stats, String(plan.fileChanges.filter((item) => item.kind === "markdown").length), t("markdownFiles"));
    this.stat(stats, String(plan.fileChanges.filter((item) => item.kind === "base").length), t("baseFiles"));
    this.stat(stats, String(plan.fileChanges.reduce((sum, item) => sum + item.operations.length, 0)), t("exactChanges"));
    const blockingFindings = plan.unresolvedFindings.filter((item) => item.severity === "blocker");
    const reviewFindings = plan.unresolvedFindings.filter((item) => item.severity !== "blocker");
    this.stat(stats, String(blockingFindings.length), t("blockers"));
    if (blockingFindings.length > 0) {
      const blockers = section.createDiv({ cls: "schema-refactor__blockers" });
      blockers.createEl("strong", { text: t("planCannotApply") });
      blockingFindings.forEach((item) => {
        const row = blockers.createDiv({ cls: "schema-refactor__blocker-row" });
        row.createEl("p", { text: `${item.filePath || t("request")}: ${findingMessage(item, t)}` });
        if (item.filePath && (item.ruleId === "MARKDOWN_CONFLICT" || item.ruleId === "BASE_CONFLICT")) {
          const select = row.createEl("select", { attr: { "aria-label": t("resolveConflict", { path: item.filePath }) } });
          const choices = item.ruleId === "BASE_CONFLICT" ? [["block", t("chooseAction")], ["keep-target", t("keepTarget")], ["keep-source", t("keepSource")], ["exclude", t("excludeFile")]] : [["block", t("chooseAction")], ["keep-target", t("keepTarget")], ["keep-source", t("keepSource")], ["merge-lists", t("mergeLists")], ["exclude", t("excludeFile")]];
          choices.forEach(([value, label]) => select.createEl("option", { value, text: label }));
          select.addEventListener("change", () => {
            if (select.value === "exclude") this.requestState.excludedPaths.add(item.filePath);
            else this.requestState.conflictDecisions[item.filePath] = select.value;
            void this.rebuildPlan();
          });
        }
      });
    }
    if (reviewFindings.length > 0) {
      const review = section.createDiv({ cls: "schema-refactor__manual-review" });
      review.createEl("strong", { text: t("manualReview", { count: reviewFindings.length }) });
      reviewFindings.forEach((item) => review.createEl("p", {
        text: `${item.filePath}${item.structuralPath ? ` > ${item.structuralPath.join(" > ")}` : ""}: ${findingMessage(item, t)}${item.evidence ? ` (${item.evidence})` : ""}`
      }));
    }
    const files = section.createDiv({ cls: "schema-refactor__files" });
    for (const change of plan.fileChanges) {
      const details = files.createEl("details", { cls: "schema-refactor__file" });
      const summary = details.createEl("summary");
      const checkbox = summary.createEl("input", { type: "checkbox", attr: { "aria-label": t("includeFilePath", { path: change.path }) } });
      checkbox.checked = !this.requestState.excludedPaths.has(change.path);
      checkbox.disabled = plan.adapterVersion === "restore-v1";
      checkbox.addEventListener("click", (event) => event.stopPropagation());
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) this.requestState.excludedPaths.delete(change.path);
        else this.requestState.excludedPaths.add(change.path);
        void this.rebuildPlan();
      });
      const name = summary.createDiv({ cls: "schema-refactor__file-name" });
      name.createEl("strong", { text: change.path });
      const counts = diffSummary(change);
      name.createSpan({ text: t("changesCount", { count: change.operations.length, additions: counts.additions, deletions: counts.deletions }) });
      const open = this.iconButton(summary, t("openSourceFile"), "file-search", false, true);
      open.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.openFile(change.path);
      });
      const evidence2 = details.createDiv({ cls: "schema-refactor__evidence" });
      change.operations.forEach((operation) => evidence2.createDiv({ text: `${operation.structuralPath.join(" > ") || t("frontmatter")}: ${operation.before} \u2192 ${operation.after}` }));
      const diff = details.createEl("pre", { cls: "schema-refactor__diff", attr: { tabindex: "0", "aria-label": t("diffFor", { path: change.path }) } });
      for (const chunk of buildLineDiff(change)) diff.createSpan({ cls: chunk.added ? "is-added" : chunk.removed ? "is-removed" : "", text: chunk.value });
    }
    for (const exclusion of plan.exclusions) {
      const row = files.createDiv({ cls: "schema-refactor__excluded-file" });
      const copy = row.createDiv();
      copy.createEl("strong", { text: exclusion.path });
      copy.createSpan({ text: t("oldReferencesRemain", { count: exclusion.remainingReferences }) });
      if (plan.adapterVersion !== "restore-v1") {
        const include = this.iconButton(row, t("includeFile"), "plus", false, true);
        include.addEventListener("click", () => {
          this.requestState.excludedPaths.delete(exclusion.path);
          void this.rebuildPlan();
        });
      }
    }
    const footer = section.createDiv({ cls: "schema-refactor__review-footer" });
    footer.createEl("p", { text: t("exclusionsSummary", { files: plan.exclusions.length, references: plan.exclusions.reduce((sum, item) => sum + item.remainingReferences, 0) }) });
    if (plan.status === "ready" && this.plugin.service.canWrite) {
      const apply = this.iconButton(footer, t("reviewAndApply"), "play", true);
      apply.disabled = this.busy;
      apply.addEventListener("click", () => new ConfirmApplyModal(this.app, plan, () => void this.applyPlan(plan), t).open());
    } else if (!this.plugin.service.canWrite) footer.createEl("p", { cls: "schema-refactor__mobile-note", text: t("mobileWritesDisabled") });
  }
  renderDoctor(root) {
    const t = this.t;
    const toolbar = root.createDiv({ cls: "schema-refactor__doctor-toolbar" });
    const heading = toolbar.createDiv();
    heading.createEl("h2", { text: t("vaultHealth") });
    heading.createEl("p", { text: t("vaultHealthHint") });
    const actions = toolbar.createDiv({ cls: "schema-refactor__actions" });
    const scan = this.iconButton(actions, t("runDoctor"), "scan-search", true);
    scan.disabled = this.busy;
    scan.addEventListener("click", () => void this.runDoctor());
    if (this.busy && this.scanController) {
      const cancel = this.iconButton(actions, t("cancelScan"), "square");
      cancel.addEventListener("click", () => this.scanController?.abort());
    }
    if (this.plugin.service.findings.length > 0) {
      const exportMd = this.iconButton(actions, t("exportMarkdown"), "file-down");
      exportMd.addEventListener("click", () => void this.exportReport("md"));
      const exportJson = this.iconButton(actions, t("exportJson"), "braces");
      exportJson.addEventListener("click", () => void this.exportReport("json"));
    }
    if (this.progress) root.createEl("p", { cls: "schema-refactor__progress", text: t("doctorProgress", { processed: this.progress.processed, total: this.progress.total }) });
    this.renderFindings(root, this.plugin.service.findings);
  }
  renderHistory(root) {
    const t = this.t;
    const section = root.createDiv({ cls: "schema-refactor__section schema-refactor__history" });
    const title = section.createDiv({ cls: "schema-refactor__section-title" });
    title.createEl("h2", { text: t("history") });
    const refresh = this.iconButton(title, t("refreshHistory"), "refresh-cw", false, true);
    refresh.addEventListener("click", () => void this.refreshHistory());
    if (this.history.length === 0) {
      section.createEl("p", { cls: "schema-refactor__muted", text: t("historyEmpty") });
      return;
    }
    for (const transaction of this.history.slice(0, 20)) {
      const row = section.createDiv({ cls: "schema-refactor__history-row" });
      const stateIcon = row.createSpan({ cls: `is-${transaction.state.toLocaleLowerCase()}`, attr: { "aria-label": transaction.state } });
      (0, import_obsidian7.setIcon)(stateIcon, transaction.state === "COMPLETED" ? "circle-check" : transaction.state === "ROLLBACK_INCOMPLETE" ? "circle-alert" : "history");
      const copy = row.createDiv();
      copy.createEl("strong", { text: `${transaction.request.oldName} \u2192 ${transaction.request.newName}` });
      copy.createSpan({ text: t("transactionSummary", { state: transactionStateLabel(transaction.state, t), count: transaction.entries.length, date: new Date(transaction.createdAt).toLocaleString(this.plugin.settings.language) }) });
      if (transaction.state === "COMPLETED" && this.plugin.service.canWrite) {
        const undo = this.iconButton(row, t("createUndoPlan"), "undo-2", false, true);
        undo.addEventListener("click", () => void this.prepareUndo(transaction));
      } else if (!["ROLLED_BACK", "ROLLBACK_INCOMPLETE", "CANCELLED"].includes(transaction.state) && this.plugin.service.canWrite) {
        const recover = this.iconButton(row, t("recoverTransaction"), "rotate-ccw", false, true);
        recover.addEventListener("click", () => void this.recoverTransaction(transaction));
      }
    }
  }
  renderFindings(root, findings) {
    const t = this.t;
    if (findings.length === 0) {
      root.createDiv({ cls: "schema-refactor__empty", text: this.plugin.service.inventory ? t("noFindings") : t("doctorEmpty") });
      return;
    }
    const groups = [["error", t("errors")], ["warning", t("warnings")], ["info", t("information")]];
    for (const [severity, label] of groups) {
      const items = findings.filter((item) => item.severity === severity);
      if (items.length === 0) continue;
      const section = root.createDiv({ cls: `schema-refactor__finding-group is-${severity}` });
      section.createEl("h3", { text: `${label} ${items.length}` });
      for (const item of items) {
        const row = section.createDiv({ cls: "schema-refactor__finding" });
        const icon = row.createSpan({ cls: "schema-refactor__finding-icon", attr: { "aria-label": severity } });
        (0, import_obsidian7.setIcon)(icon, severity === "error" ? "circle-alert" : severity === "warning" ? "triangle-alert" : "info");
        const copy = row.createDiv();
        copy.createEl("strong", { text: findingMessage(item, t) });
        copy.createDiv({ cls: "schema-refactor__finding-meta", text: `${item.ruleId} \xB7 ${item.filePath || t("vault")}${item.structuralPath ? ` \xB7 ${item.structuralPath.join(" > ")}` : ""}` });
        if (item.suggestedAction === "create-refactor" && item.refactorRequest) {
          const refactor = this.iconButton(row, t("createRefactorPlan"), "replace", false, true);
          refactor.addEventListener("click", () => this.createRefactorFromFinding(item));
        }
        if (item.filePath) {
          const open = this.iconButton(row, t("openFile"), "external-link", false, true);
          open.addEventListener("click", () => void this.openFile(item.filePath));
        }
      }
    }
  }
  field(parent, label, description) {
    const field = parent.createEl("label", { cls: "schema-refactor__field" });
    field.createSpan({ cls: "schema-refactor__label", text: label });
    field.createSpan({ cls: "schema-refactor__hint", text: description });
    return field;
  }
  iconButton(parent, label, icon, primary = false, iconOnly = false) {
    const button = parent.createEl("button", { cls: `${primary ? "mod-cta " : ""}${iconOnly ? "clickable-icon" : "schema-refactor__button"}`, attr: { "aria-label": label } });
    (0, import_obsidian7.setIcon)(button, icon);
    if (!iconOnly) button.createSpan({ text: label });
    if (iconOnly) button.setAttribute("data-tooltip-position", "top");
    return button;
  }
  stat(parent, value, label) {
    const item = parent.createDiv();
    item.createEl("strong", { text: value });
    item.createSpan({ text: label });
  }
  invalidateRenderedPlan() {
    this.plugin.service.plan = void 0;
    this.contentEl.querySelector(".schema-refactor__review")?.remove();
    this.contentEl.querySelector(".schema-refactor__result")?.remove();
    const steps = this.contentEl.querySelectorAll(".schema-refactor__steps > div");
    for (let index = 2; index < steps.length; index += 1) steps[index]?.classList.remove("is-complete");
  }
  async scanAndPlan() {
    const t = this.t;
    if (!this.requestState.oldName || !this.requestState.newName) {
      new import_obsidian7.Notice(t("enterPropertyNames"));
      return;
    }
    this.busy = true;
    this.progress = void 0;
    this.requestState.resultMessage = "";
    this.scanController = new AbortController();
    this.render();
    try {
      await this.plugin.service.scan((progress) => {
        this.progress = progress;
        if (progress.processed === progress.total || progress.processed % 50 === 0) this.render();
      }, this.scanController.signal);
      await this.rebuildPlan(false);
    } catch (error) {
      new import_obsidian7.Notice(error instanceof DOMException && error.name === "AbortError" ? t("scanCancelled") : error instanceof Error ? error.message : t("scanFailed"));
    } finally {
      this.busy = false;
      this.scanController = void 0;
      this.render();
    }
  }
  async rebuildPlan(render = true) {
    const plan = await this.plugin.service.createPlan({ oldName: this.requestState.oldName, newName: this.requestState.newName, defaultConflictDecision: this.conflictDecision, conflictDecisions: this.requestState.conflictDecisions, excludedPaths: [...this.requestState.excludedPaths] });
    this.requestState.setReviewedPlan(plan);
    if (render) this.render();
  }
  async applyPlan(plan) {
    const t = this.t;
    const progressModal = new ApplyProgressModal(this.app, t);
    progressModal.open();
    this.busy = true;
    this.requestState.resultMessage = t("preparingTransaction");
    this.render();
    try {
      const result = await this.plugin.service.apply(plan, { onState: (state, path) => {
        progressModal.update(state, path);
        this.requestState.resultMessage = `${transactionStateLabel(state, t)}${path ? ` \xB7 ${path}` : ""}`;
        this.render();
      } });
      this.requestState.resultMessage = result.state === "COMPLETED" ? t("completedFiles", { count: result.modifiedPaths.length }) : result.state === "ROLLED_BACK" ? t("applyRolledBack") : t("rollbackIncomplete", { paths: result.rollbackIncompletePaths.join(", ") });
      this.history = await this.plugin.service.history();
      await this.plugin.service.pruneHistory(this.plugin.settings.snapshotRetention);
      new import_obsidian7.Notice(this.requestState.resultMessage, 8e3);
    } catch (error) {
      this.requestState.resultMessage = error instanceof Error ? error.message : t("applyFailed");
      progressModal.fail(this.requestState.resultMessage);
      new import_obsidian7.Notice(this.requestState.resultMessage, 8e3);
    } finally {
      this.busy = false;
      this.render();
    }
  }
  async prepareUndo(transaction) {
    const t = this.t;
    try {
      const result = await this.plugin.service.createRestorePlan(transaction);
      this.requestState.oldName = result.plan.request.oldName;
      this.requestState.newName = result.plan.request.newName;
      this.requestState.excludedPaths = new Set(result.plan.request.excludedPaths ?? []);
      this.requestState.setReviewedPlan(result.plan);
      this.requestState.resultMessage = [...result.divergedPaths, ...result.missingPaths].length > 0 ? t("undoExcludesFiles", { paths: [...result.divergedPaths, ...result.missingPaths].join(", ") }) : t("undoReady");
      this.render();
    } catch (error) {
      new import_obsidian7.Notice(error instanceof Error ? error.message : t("undoFailed"));
    }
  }
  async refreshHistory() {
    this.history = await this.plugin.service.history();
    this.render();
  }
  async recoverTransaction(transaction) {
    const t = this.t;
    const confirmed = await new Promise((resolve) => new RecoveryConfirmModal(this.app, transaction.transactionId, resolve, t).open());
    if (!confirmed) return;
    this.busy = true;
    this.requestState.resultMessage = t("checkingRecovery");
    this.render();
    try {
      const result = await this.plugin.service.recoverTransaction(transaction);
      this.requestState.resultMessage = result?.state === "ROLLED_BACK" ? t("recoveryComplete") : result?.state === "ROLLBACK_INCOMPLETE" ? t("recoveryIncomplete", { paths: result.rollbackIncompletePaths.join(", ") }) : t("recoveryNotRequired");
      this.history = await this.plugin.service.history();
      new import_obsidian7.Notice(this.requestState.resultMessage, 1e4);
    } catch (error) {
      this.requestState.resultMessage = error instanceof Error ? error.message : t("recoveryFailed");
      new import_obsidian7.Notice(this.requestState.resultMessage, 1e4);
    } finally {
      this.busy = false;
      this.render();
    }
  }
  async runDoctor() {
    const t = this.t;
    this.busy = true;
    this.progress = void 0;
    this.scanController = new AbortController();
    this.render();
    try {
      await this.plugin.service.doctor((progress) => {
        this.progress = progress;
        if (progress.processed === progress.total || progress.processed % 50 === 0) this.render();
      }, this.scanController.signal);
    } catch (error) {
      new import_obsidian7.Notice(error instanceof DOMException && error.name === "AbortError" ? t("doctorCancelled") : error instanceof Error ? error.message : t("doctorFailed"));
    } finally {
      this.busy = false;
      this.scanController = void 0;
      this.render();
    }
  }
  async exportReport(extension) {
    const report = createReport(this.plugin.service.findings, this.plugin.manifest.version, (/* @__PURE__ */ new Date()).toISOString(), {
      includeTypeStats: extension === "json" && this.plugin.settings.includeTypeStats,
      ...this.plugin.service.inventory ? { propertyTypes: this.plugin.service.inventory.propertyTypes } : {}
    });
    const stamp = (/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
    const path = `schema-refactor-report-${stamp}.${extension}`;
    await this.app.vault.create(path, extension === "md" ? reportToMarkdown(report) : reportToJson(report));
    new import_obsidian7.Notice(this.t("reportCreated", { path }));
  }
  async openFile(path) {
    const file = this.app.vault.getFileByPath(path);
    if (!file) {
      new import_obsidian7.Notice(this.t("fileNotFound", { path }));
      return;
    }
    await this.app.workspace.getLeaf(false).openFile(file);
  }
  createRefactorFromFinding(finding2) {
    if (!finding2.refactorRequest) return;
    this.requestState.invalidateReview();
    this.plugin.service.plan = void 0;
    this.requestState.oldName = finding2.refactorRequest.oldName;
    this.requestState.newName = finding2.refactorRequest.newName;
    this.tab = "refactor";
    this.render();
  }
};

// src/main.ts
var SchemaRefactorPlugin = class extends import_obsidian8.Plugin {
  settings = DEFAULT_SETTINGS;
  service;
  ribbonIcon;
  openCommand;
  doctorCommand;
  async onload() {
    await this.loadSettings();
    const t = createTranslator(this.settings.language);
    this.service = new SchemaRefactorService(this.app, this.manifest.id, () => this.settings);
    this.registerView(SCHEMA_REFACTOR_VIEW, (leaf) => new SchemaRefactorView(leaf, this));
    this.ribbonIcon = this.addRibbonIcon("scan-search", t("openApp"), () => void this.activateView());
    this.openCommand = this.addCommand({ id: "open", name: t("openApp"), callback: () => void this.activateView() });
    this.doctorCommand = this.addCommand({ id: "run-doctor", name: t("runDoctorCommand"), callback: () => void this.runDoctor() });
    this.addSettingTab(new SchemaRefactorSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => void this.recoverAndOptionallyScan());
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.settings.language = normalizeLanguage(this.settings.language);
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async setLanguage(language) {
    this.settings.language = language;
    const t = createTranslator(language);
    if (this.ribbonIcon) (0, import_obsidian8.setTooltip)(this.ribbonIcon, t("openApp"));
    if (this.openCommand) this.openCommand.name = t("openApp");
    if (this.doctorCommand) this.doctorCommand.name = t("runDoctorCommand");
    for (const leaf of this.app.workspace.getLeavesOfType(SCHEMA_REFACTOR_VIEW)) {
      if (leaf.view instanceof SchemaRefactorView) leaf.view.refreshLanguage();
    }
    await this.saveSettings();
  }
  async activateView() {
    let leaf = this.app.workspace.getLeavesOfType(SCHEMA_REFACTOR_VIEW)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
      await leaf.setViewState({ type: SCHEMA_REFACTOR_VIEW, active: true });
    }
    await this.app.workspace.revealLeaf(leaf);
  }
  async runDoctor() {
    await this.activateView();
    const findings = await this.service.doctor();
    new import_obsidian8.Notice(createTranslator(this.settings.language)("doctorFound", { count: findings.length }));
  }
  async recoverAndOptionallyScan() {
    if (this.service.canWrite) {
      const incomplete = (await this.service.history()).filter((transaction) => !["COMPLETED", "ROLLED_BACK", "ROLLBACK_INCOMPLETE", "CANCELLED"].includes(transaction.state));
      if (incomplete.length > 0) {
        const t = createTranslator(this.settings.language);
        new import_obsidian8.Notice(incomplete.length === 1 ? t("interruptedTransaction") : t("interruptedTransactions", { count: incomplete.length }), 1e4);
        await this.activateView();
      }
    }
    await this.service.pruneHistory(this.settings.snapshotRetention);
    if (this.settings.scanOnStartup) await this.service.doctor();
  }
};

/* nosourcemap */