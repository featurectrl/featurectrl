import {readFile} from "node:fs/promises";
import path from "node:path";
import type * as esbuild from "esbuild";
import mime from "mime-types";

const LOADER_FILTER: RegExp = /\?dataurl$/;

async function loaderLoadFile(filePath: string): Promise<string> {
  const contents = await readFile(filePath);
  const mimeType = mime.lookup(filePath) || "application/octet-stream";
  return `data:${mimeType};base64,${contents.toString("base64")}`;
}

export function loaderResolveFilePath(filePath: string) {
  return filePath.replace(LOADER_FILTER, "");
}

export const dataUrlLoader: esbuild.Plugin = {
  name: "dataurl-query",

  setup(build) {
    build.onResolve({ filter: LOADER_FILTER }, (args) => ({
      path: loaderResolveFilePath(path.resolve(args.resolveDir, args.path)),
      namespace: "dataurl-loader",
    }));
    build.onLoad({ filter: /.*/, namespace: "dataurl-loader" }, async ({ path: filePath }) => ({
      contents: `export default ${JSON.stringify(await loaderLoadFile(filePath))};`,
      loader: "js",
    }));
  },
};

if (typeof Bun !== "undefined") {
  Bun.plugin({
    name: "dataurl-query",
    setup(builder) {
      builder.onResolve({ filter: LOADER_FILTER }, (args) => ({
        path: loaderResolveFilePath(path.resolve(path.dirname(args.importer), args.path)),
        namespace: "dataurl-loader",
      }));

      builder.onLoad({ filter: /.*/, namespace: "dataurl-loader" }, async ({ path: filePath }) => ({
        exports: { default: await loaderLoadFile(filePath) },
        loader: "object",
      }));
    },
  });
}
