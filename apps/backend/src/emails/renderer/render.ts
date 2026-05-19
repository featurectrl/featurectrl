import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { inlineTailwind } from "./tailwind";

const DOCTYPE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`;

export async function renderJSX(element: ReactElement): Promise<string> {
  const html = await inlineTailwind(renderToStaticMarkup(element));
  return `${DOCTYPE}${html.replace(/<!DOCTYPE[^>]*>/, "")}`;
}
