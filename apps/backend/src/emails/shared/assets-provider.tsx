import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, type ReactNode, useCallback, useContext } from "react";
import type { EmailAttachment } from "@/emails/types";

function resolveAssetsDir(): string {
  const fromModule = fileURLToPath(new URL("./assets/", import.meta.url));
  if (existsSync(fromModule)) {
    return fromModule;
  }

  return join(process.cwd(), "src/emails/assets");
}

const ASSETS_DIR = resolveAssetsDir();

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

function normalizeAssetPath(assetPath: string): string {
  const absolutePath = resolve(ASSETS_DIR, assetPath);
  assert(absolutePath.startsWith(ASSETS_DIR));
  return relative(ASSETS_DIR, absolutePath);
}

function loadAsset(assetPath: string) {
  const resolvedPath = resolve(ASSETS_DIR, assetPath);

  const content = readFileSync(resolvedPath);

  const ext = extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return {
    content,
    contentType,
  };
}

export function createAttachmentCollector(): EmailAttachment[] {
  return [];
}

const Context = createContext<
  | {
      useImage: (path: string) => string;
    }
  | undefined
>(undefined);

export function useImage(path: string): string {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useImage must be used within an AssetProvider or InlineAssetProvider");
  }
  return ctx.useImage(path);
}

type InlineAssetProviderProps = {
  children: ReactNode;
};

export function InlineAssetProvider({ children }: InlineAssetProviderProps) {
  const useImage = useCallback((path: string) => {
    const { content, contentType } = loadAsset(path);
    return `data:${contentType};base64,${content.toString("base64")}`;
  }, []);

  return <Context.Provider value={{ useImage }}>{children}</Context.Provider>;
}

type AssetProviderProps = {
  attachmentsCollector: EmailAttachment[];
  children: ReactNode;
};

export function AssetProvider({ attachmentsCollector, children }: AssetProviderProps) {
  const useImage = useCallback(
    (path: string) => {
      path = normalizeAssetPath(path);

      const cid = path.replaceAll("/", "-");

      const existing = attachmentsCollector.find((a) => a.cid === cid);
      if (!existing) {
        const { content, contentType } = loadAsset(path);
        attachmentsCollector.push({
          filename: basename(path),
          cid,
          content,
          contentType,
          contentDisposition: "inline",
        });
      }

      return `cid:${cid}`;
    },
    [attachmentsCollector],
  );

  return <Context.Provider value={{ useImage }}>{children}</Context.Provider>;
}
