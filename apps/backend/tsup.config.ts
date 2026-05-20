import {cp} from "node:fs/promises";
import {defineConfig} from "tsup";
import {dataUrlLoader} from "./build-tools/dataurl-loader";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      migrate: "src/migrate.ts",
    },
    format: ["esm"],
    outDir: "dist",
    target: "es2023",
    platform: "node",
    bundle: true,
    splitting: false,
    sourcemap: (process.env.SOURCEMAP === "true"),
    clean: true,
    dts: false,
    skipNodeModulesBundle: true,
    esbuildPlugins: [dataUrlLoader],
    async onSuccess() {
      await cp("src/db/migrations", "dist/db/migrations", {
        recursive: true
      });
    },
  },
  {
    entry: {
      "types/trpc": "src/trpc/types.ts",
    },
    clean: true,
    format: ["esm"],
    outDir: "dist",
    dts: { only: true },
  }
]);
