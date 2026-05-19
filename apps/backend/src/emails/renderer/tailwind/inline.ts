import type { RuleMap } from "./extract";

const VAR_RE = /var\(\s*(--[\w-]+)(?:\s*,\s*((?:[^()]|\([^()]*\))*))?\s*\)/g;

function resolveVars(
  value: string,
  localVars: Map<string, string>,
  rules: RuleMap,
  depth = 0,
): string {
  if (depth > 10) return value;
  return value.replace(VAR_RE, (_match, name, fallback) => {
    const local = localVars.get(name);
    if (local !== undefined) return resolveVars(local, localVars, rules, depth + 1);

    const rootVal = rules.rootVars.get(name);
    if (rootVal !== undefined) return resolveVars(rootVal, localVars, rules, depth + 1);

    const init = rules.propertyInitials.get(name);
    if (init !== undefined && init !== "initial") {
      return resolveVars(init, localVars, rules, depth + 1);
    }

    if (fallback !== undefined) return resolveVars(fallback.trim(), localVars, rules, depth + 1);

    return "";
  });
}

function classesToStyle(classes: string[], rules: RuleMap): string {
  const localVars = new Map<string, string>();
  const props = new Map<string, string>();

  for (const cls of classes) {
    const decls = rules.classRules.get(cls);
    if (!decls) continue;
    for (const { property, value } of decls) {
      const resolved = resolveVars(value, localVars, rules);
      if (property.startsWith("--")) {
        localVars.set(property, resolved);
      } else {
        props.set(property, resolved);
      }
    }
  }

  return Array.from(props.entries())
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

const TAG_RE = /<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
const CLASS_RE = /\sclass="([^"]+)"/;
const STYLE_RE = /\sstyle="([^"]*)"/;

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

export function inlineHtmlClasses(html: string, rules: RuleMap): string {
  return html.replace(TAG_RE, (match, tag, attrs) => {
    const classMatch = CLASS_RE.exec(attrs);
    if (!classMatch) return match;

    const classes = classMatch[1].split(/\s+/).filter(Boolean);
    const styleStr = classesToStyle(classes, rules);

    let newAttrs: string = attrs.replace(CLASS_RE, "");

    if (styleStr) {
      const existingStyle = STYLE_RE.exec(newAttrs);
      if (existingStyle) {
        newAttrs = newAttrs.replace(
          STYLE_RE,
          ` style="${escapeAttr(styleStr)};${existingStyle[1]}"`,
        );
      } else {
        const trailingSlash = newAttrs.endsWith("/") ? "/" : "";
        const cleaned = trailingSlash ? newAttrs.slice(0, -1).trimEnd() : newAttrs.trimEnd();
        newAttrs = `${cleaned} style="${escapeAttr(styleStr)}"${trailingSlash}`;
      }
    }

    return `<${tag}${newAttrs}>`;
  });
}
