import { compileTailwindAst } from "./compile";
import { extractRules } from "./extract";
import { inlineHtmlClasses } from "./inline";

const CLASS_ATTR_RE = /\sclass="([^"]+)"/g;

export async function inlineTailwind(html: string): Promise<string> {
  const classes = new Set<string>();
  for (const match of html.matchAll(CLASS_ATTR_RE)) {
    for (const c of match[1].split(/\s+/).filter(Boolean)) classes.add(c);
  }
  if (classes.size === 0) return html;

  const ast = await compileTailwindAst([...classes]);
  const rules = extractRules(ast);
  return inlineHtmlClasses(html, rules);
}
