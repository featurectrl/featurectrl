/** biome-ignore-all lint/complexity/useRegexLiterals: we use lots of regex for fs pathes, they are ugly with regex literals */
import path from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import visualizer from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "../..");
  const env = loadEnv(mode, envDir, "");

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        routeFileIgnorePattern: "(_components|_hooks|_lib)",
        autoCodeSplitting: true,
      }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      mode === "development" &&
        visualizer({
          filename: "dist/stats.html",
          gzipSize: true,
          brotliSize: true,
          template: "treemap",
        }),
    ],
    envDir,
    envPrefix: [],
    define: {
      "import.meta.env.PUBLIC_BFF_API_URL": JSON.stringify(
        env.STANDALONE === "true" ? "/_" : env.BFF_API_ORIGIN,
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "vendor~react",
                test: new RegExp("/node_modules/(react|react-dom)/"),
                entriesAware: false,
              },

              {
                name: "vendor~better-auth",
                test: new RegExp("/node_modules/better-auth/"),
                entriesAware: false,
              },

              {
                name: "vendor~react-hook-form",
                test: new RegExp("/node_modules/(react-hook-form|@hookform/resolvers)/"),
                entriesAware: false,
              },

              {
                name: "vendor~motion",
                test: new RegExp("/node_modules/(motion|framer-motion)/"),
                entriesAware: false,
              },

              {
                name: "vendor~shikijs",
                test: new RegExp("/node_modules/@shikijs/"),
                entriesAware: false,
              },

              {
                name: "vendor~tanstack-react-query",
                test: new RegExp("/node_modules/@tanstack/react-query/"),
                entriesAware: false,
              },

              {
                name: "vendor~trpc",
                test: new RegExp("/node_modules/@trpc/"),
                entriesAware: false,
              },

              {
                name: "vendor~zod",
                test: new RegExp("/node_modules/zod/"),
                entriesAware: false,
              },
            ],
          },
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] ?? "";
            if (/\.(woff2?|ttf|otf|eot)$/i.test(name)) {
              return "fonts/[name]-[hash][extname]";
            }

            return "assets/[name]-[hash][extname]";
          },
          chunkFileNames: (chunkInfo) => {
            const moduleId = chunkInfo.facadeModuleId ?? "";
            if (moduleId.includes("/src/routes/")) {
              return "routes/[name]-[hash].js";
            }

            return "assets/[name]-[hash].js";
          },
        },
      },
    },
  };
});
