import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    PORT: z.coerce.number().int().positive().default(3000),

    STANDALONE: z
      .string()
      .optional()
      .transform((value) => value === "true"),

    ORIGIN: z.url(),
    BFF_API_ORIGIN: z.url().optional(),
    REST_API_ORIGIN: z.url().optional(),

    DATABASE_URL: z.url({ protocol: /^postgres$/ }),

    BETTER_AUTH_SECRET: z.string().min(16),

    // auth
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    DEBUG_SLOW_MODE: z
      .string()
      .optional()
      .transform((value) => value === "true"),
  })
  .transform((data, ctx) => {
    if (data.STANDALONE) {
      const origin = data.ORIGIN.replace(/\/$/, "");
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
        message: "BFF_API_ORIGIN is required",
      });
      return z.NEVER;
    }

    if (!data.REST_API_ORIGIN) {
      ctx.addIssue({
        code: "custom",
        path: ["REST_API_ORIGIN"],
        message: "REST_API_ORIGIN is required",
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
