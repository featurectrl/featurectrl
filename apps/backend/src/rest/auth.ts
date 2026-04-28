import { eq } from "drizzle-orm";
import type { FastifyRequest } from "fastify";
import { db } from "@/db";
import { apiKey } from "@/db/schema";
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

async function lookupOrganizationByKey(
  column: typeof apiKey.publicKey | typeof apiKey.privateKey,
  token: string,
): Promise<{ organizationId: string }> {
  const [row] = await db
    .select({ organizationId: apiKey.organizationId })
    .from(apiKey)
    .where(eq(column, token))
    .limit(1);

  if (!row) {
    throw new RestError(401, "Invalid API key");
  }
  return { organizationId: row.organizationId };
}

export function authenticateWithPublicApiKey(
  req: FastifyRequest,
): Promise<{ organizationId: string }> {
  return lookupOrganizationByKey(apiKey.publicKey, extractToken(req));
}

export function authenticateWithPrivateApiKey(
  req: FastifyRequest,
): Promise<{ organizationId: string }> {
  return lookupOrganizationByKey(apiKey.privateKey, extractToken(req));
}
