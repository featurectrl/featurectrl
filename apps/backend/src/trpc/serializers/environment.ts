import type { InferSelectModel } from "drizzle-orm";
import type { environment } from "@/db/schema";

export type BaseEnvironment = Pick<
  InferSelectModel<typeof environment>,
  "id" | "name" | "displayName" | "createdAt" | "archivedAt"
>;
export type Environment = BaseEnvironment;

export function serializeBaseEnvironment(
  row: InferSelectModel<typeof environment>,
): BaseEnvironment {
  const { organizationId: _organizationId, ...rest } = row;
  return rest;
}

export const serializeEnvironment = serializeBaseEnvironment;
