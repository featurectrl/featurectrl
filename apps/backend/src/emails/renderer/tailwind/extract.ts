import type { AstNode } from "./compile";

export interface Decl {
  property: string;
  value: string;
}

export interface RuleMap {
  rootVars: Map<string, string>;
  classRules: Map<string, Decl[]>;
  propertyInitials: Map<string, string>;
}

const CLASS_SELECTOR_RE = /^\.[\w-]+$/;

function declsFrom(nodes: AstNode[]): Decl[] {
  const decls: Decl[] = [];
  for (const node of nodes) {
    if (node.kind === "declaration" && node.value !== undefined) {
      decls.push({ property: node.property, value: node.value });
    }
  }
  return decls;
}

export function extractRules(ast: AstNode[]): RuleMap {
  const rules: RuleMap = {
    rootVars: new Map(),
    classRules: new Map(),
    propertyInitials: new Map(),
  };

  function visit(nodes: AstNode[]) {
    for (const node of nodes) {
      if (node.kind === "rule") {
        const selectors = node.selector.split(",").map((s) => s.trim());

        if (selectors.some((s) => s === ":root" || s === ":host")) {
          for (const decl of declsFrom(node.nodes)) {
            if (decl.property.startsWith("--")) rules.rootVars.set(decl.property, decl.value);
          }
          continue;
        }

        if (selectors.length === 1 && CLASS_SELECTOR_RE.test(selectors[0])) {
          rules.classRules.set(selectors[0].slice(1), declsFrom(node.nodes));
        }
        continue;
      }

      if (node.kind === "at-rule") {
        if (node.name === "@property") {
          const name = node.params.trim();
          for (const decl of declsFrom(node.nodes)) {
            if (decl.property === "initial-value") rules.propertyInitials.set(name, decl.value);
          }
          continue;
        }
        visit(node.nodes);
        continue;
      }

      if (node.kind === "at-root" || node.kind === "context") {
        visit(node.nodes);
      }
    }
  }

  visit(ast);
  return rules;
}
