import { z } from "zod";

export const featureFlagValueSchema = z.union([
  z.object({
    enabled: z.literal(true),
    disabled: z
      .object({
        segments: z.array(z.string()),
      })
      .optional(),
  }),

  z.object({
    enabled: z.literal(false),
    disabled: z.undefined().optional(),
  }),

  z.object({
    enabled: z.object({ segments: z.array(z.string()) }),
    disabled: z.undefined().optional(),
  }),
]);

export type FeatureFlagValue = z.infer<typeof featureFlagValueSchema>;
