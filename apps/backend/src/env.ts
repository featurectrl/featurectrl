import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    DEBUG_SLOW_MODE: z
      .string()
      .optional()
      .transform((value) => value === "true"),

    STANDALONE: z
      .string()
      .optional()
      .transform((value) => value === "true"),

    STANDALONE_ORIGIN: z.url().optional(),

    BACKEND_PORT: z.coerce.number().int().positive().default(3000),

    BACKEND_TRUSTED_ORIGINS: z.string().transform((value) => {
      if (!value) {
        return undefined;
      }

      return value.split(",").filter(Boolean);
    }),

    BFF_API_ORIGIN: z.url().optional(),
    REST_API_ORIGIN: z.url().optional(),

    DATABASE_URL: z.url({ protocol: /^postgres$/ }),

    BETTER_AUTH_SECRET: z.string().min(16),

    // auth
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  })
  .transform((data, ctx) => {
    if (data.STANDALONE) {
      if (!data.STANDALONE_ORIGIN) {
        ctx.addIssue({
          code: "custom",
          path: ["STANDALONE_ORIGIN"],
          message: "STANDALONE_ORIGIN is required when STANDALONE=true",
        });
        return z.NEVER;
      }

      const origin = data.STANDALONE_ORIGIN.replace(/\/$/, "");
      return {
        ...data,
        BFF_API_ORIGIN: `${origin}/_`,
        REST_API_ORIGIN: `${origin}/api`,
      };
    }

    if (!data.BFF_API_ORIGIN) {
      ctx.addIssue({
        code: "custom",
        path: ["BFF_API_ORIGIN"],
        message: "BFF_API_ORIGIN is required when STANDALONE is not set",
      });
      return z.NEVER;
    }

    if (!data.REST_API_ORIGIN) {
      ctx.addIssue({
        code: "custom",
        path: ["REST_API_ORIGIN"],
        message: "REST_API_ORIGIN is required when STANDALONE is not set",
      });
      return z.NEVER;
    }

    return {
      ...data,
      BFF_API_ORIGIN: data.BFF_API_ORIGIN,
      REST_API_ORIGIN: data.REST_API_ORIGIN,
    };
  });

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
