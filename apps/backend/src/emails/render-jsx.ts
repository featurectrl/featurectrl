import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const DOCTYPE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`;

export function renderJSX(element: ReactElement): string {
  const html = renderToStaticMarkup(element).replace(/<!DOCTYPE[^>]*>/i, "");
  return `${DOCTYPE}\n${html}`;
}
