import { detect } from "detect-browser";

export interface ParsedUserAgent {
  label: string;
  deviceType: "desktop" | "mobile" | "tablet";
}

const BROWSER_LABELS: Record<string, string> = {
  chrome: "Chrome",
  crios: "Chrome",
  chromium: "Chrome",
  firefox: "Firefox",
  fxios: "Firefox",
  safari: "Safari",
  "ios-webview": "Safari",
  ios: "Safari",
  edge: "Edge",
  "edge-chromium": "Edge",
  "edge-ios": "Edge",
  opera: "Opera",
  "opera-mini": "Opera",
};

function formatOs(os: string | null | undefined, userAgent: string): string {
  if (/iPad/.test(userAgent)) return "iPadOS";
  if (!os) return "Unknown OS";
  if (os === "iOS") return "iOS";
  if (os.startsWith("Android")) return "Android";
  if (os.startsWith("Windows")) return "Windows";
  if (os === "Mac OS") return "macOS";
  if (os === "Linux") return "Linux";
  return os;
}

export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) return { label: "Unknown device", deviceType: "desktop" };

  const info = detect(userAgent);
  const browser = (info?.name && BROWSER_LABELS[info.name]) ?? "Browser";
  const os = formatOs(info?.os, userAgent);

  const deviceType: ParsedUserAgent["deviceType"] = /iPad|Tablet/.test(userAgent)
    ? "tablet"
    : /iPhone|iPod|Android.*Mobile|Mobile/.test(userAgent)
      ? "mobile"
      : "desktop";

  return { label: `${browser} on ${os}`, deviceType };
}
