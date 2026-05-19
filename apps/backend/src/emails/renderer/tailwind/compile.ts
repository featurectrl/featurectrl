import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { compileAst } from "tailwindcss";
import { pixelBasedPreset } from "./pixel-based-preset";

export type Declaration = {
  kind: "declaration";
  property: string;
  value: string | undefined;
};

export type StyleRule = {
  kind: "rule";
  selector: string;
  nodes: AstNode[];
};

export type AtRule = {
  kind: "at-rule";
  name: string;
  params: string;
  nodes: AstNode[];
};

export type AstNode =
  | StyleRule
  | AtRule
  | Declaration
  | { kind: "comment"; value: string }
  | { kind: "at-root"; nodes: AstNode[] }
  | { kind: "context"; nodes: AstNode[] };

const require = createRequire(import.meta.url);
const tailwindDir = dirname(require.resolve("tailwindcss/package.json"));

function readTailwindStylesheet(name: string): string {
  return readFileSync(`${tailwindDir}/${name}`, "utf-8");
}

function buildBaseAst(): AstNode[] {
  return [
    { kind: "at-rule", name: "@layer", params: "theme, base, components, utilities", nodes: [] },
    {
      kind: "at-rule",
      name: "@import",
      params: '"tailwindcss/theme.css" layer(theme)',
      nodes: [],
    },
    {
      kind: "at-rule",
      name: "@import",
      params: '"tailwindcss/utilities.css" layer(utilities)',
      nodes: [],
    },
    { kind: "at-rule", name: "@config", params: "", nodes: [] },
  ];
}

export async function compileTailwindAst(candidates: string[]): Promise<AstNode[]> {
  // biome-ignore lint/suspicious/noExplicitAny: tailwindcss AstNode types are not exported
  const compiler = await compileAst(buildBaseAst() as any, {
    async loadModule(id, base, hint) {
      if (hint === "config") {
        return { path: id, base, module: { presets: [pixelBasedPreset] } };
      }
      throw new Error(`Cannot load module: ${id}`);
    },
    async loadStylesheet(id, base) {
      if (id === "tailwindcss/theme.css") {
        return { base, path: id, content: readTailwindStylesheet("theme.css") };
      }
      if (id === "tailwindcss/utilities.css") {
        return { base, path: id, content: readTailwindStylesheet("utilities.css") };
      }
      throw new Error(`Cannot load stylesheet: ${id}`);
    },
  });
  return compiler.build(candidates) as AstNode[];
}
