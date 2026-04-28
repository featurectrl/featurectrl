import { useMemo } from "react";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import json from "shiki/langs/json.mjs";
import dark from "shiki/themes/github-dark.mjs";
import light from "shiki/themes/github-light.mjs";

interface JsonCodeLazyProps {
  json: string;
  className?: string;
}

const highlighter = createHighlighterCoreSync({
  themes: [light, dark],
  langs: [json],
  engine: createJavaScriptRegexEngine(),
});

export function JsonCodeLazy({ json, className }: JsonCodeLazyProps) {
  const html = useMemo(() => {
    return highlighter.codeToHtml(json, {
      lang: "json",
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
  }, [json]);

  // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is trusted (we serialize the input ourselves)
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
