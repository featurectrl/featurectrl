import { and, eq } from "drizzle-orm";
import type { FastifyRequest } from "fastify";
import { db } from "@/db";
import { apiKey, organization } from "@/db/schema";
import { RestError } from "./errors";

function extractToken(req: FastifyRequest): string {
  const header = req.headers.authorization;
  if (!header) {
    throw new RestError(401, "Missing Authorization header");
  }
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : header.trim();
  if (!token) {
    throw new RestError(401, "Missing API key");
  }
  return token;
}

async function resolveOrganization(
  column: typeof apiKey.publicKey | typeof apiKey.privateKey,
  token: string,
  orgSlug: string,
): Promise<{ organizationId: string }> {
  const [row] = await db
    .select({ organizationId: organization.id })
    .from(apiKey)
    .innerJoin(organization, eq(organization.id, apiKey.organizationId))
    .where(and(eq(column, token), eq(organization.slug, orgSlug)))
    .limit(1);

  if (!row) {
    throw new RestError(401, "Invalid API key");
  }
  return { organizationId: row.organizationId };
}

export function authenticateWithPublicApiKey(
  req: FastifyRequest,
  orgSlug: string,
): Promise<{ organizationId: string }> {
  return resolveOrganization(apiKey.publicKey, extractToken(req), orgSlug);
}

export function authenticateWithPrivateApiKey(
  req: FastifyRequest,
  orgSlug: string,
): Promise<{ organizationId: string }> {
  return resolveOrganization(apiKey.privateKey, extractToken(req), orgSlug);
}
