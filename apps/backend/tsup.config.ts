import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    outDir: "dist",
    target: "es2023",
    platform: "node",
    bundle: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: false,
    skipNodeModulesBundle: true,
    async onSuccess() {
      const manifest = JSON.parse(readFileSync("package.json", "utf8"));
      const drizzleKitVersion = manifest.devDependencies?.["drizzle-kit"];
      if (!drizzleKitVersion) {
        throw new Error("drizzle-kit version not found in devDependencies");
      }

      const standaloneManifest = {
        name: "@featurectrl/standalone",
        private: true,
        version: manifest.version ?? "0.0.0",
        type: "module",
        main: "index.js",
        dependencies: {
          ...manifest.dependencies,
          "drizzle-kit": drizzleKitVersion,
        },
      };

      writeFileSync(
        "dist/package.json",
        `${JSON.stringify(standaloneManifest, null, 2)}\n`,
      );
      cpSync("src/db/migrations", "dist/migrations", { recursive: true });
    },
  },
  {
    entry: {
      "types/trpc": "src/trpc/types.ts",
    },
    format: ["esm"],
    outDir: "dist",
    dts: { only: true },
  },
]);
