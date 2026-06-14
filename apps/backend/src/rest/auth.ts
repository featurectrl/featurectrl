import { and, eq, gt, isNull, or } from "drizzle-orm";
import type { FastifyRequest } from "fastify";
import { db } from "@/db";
import { apiKey, organization, publicKey } from "@/db/schema";
import { hashSecretKey } from "@/lib/secrets";
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

// The key is valid only while it has no expiry or its expiry is still in the future.
function notExpired(column: typeof apiKey.expiresAt | typeof publicKey.expiresAt) {
  return or(isNull(column), gt(column, new Date()));
}

export async function authenticateWithPrivateApiKey(
  req: FastifyRequest,
  orgSlug: string,
): Promise<{ organizationId: string }> {
  const hashedKey = hashSecretKey(extractToken(req));

  const [row] = await db
    .select({ organizationId: organization.id })
    .from(apiKey)
    .innerJoin(organization, eq(organization.id, apiKey.organizationId))
    .where(
      and(
        eq(apiKey.hashedKey, hashedKey),
        eq(organization.slug, orgSlug),
        notExpired(apiKey.expiresAt),
      ),
    )
    .limit(1);

  if (!row) {
    throw new RestError(401, "Invalid API key");
  }
  return { organizationId: row.organizationId };
}

export async function authenticateWithPublicApiKey(
  req: FastifyRequest,
  orgSlug: string,
): Promise<{ organizationId: string }> {
  const token = extractToken(req);

  const [row] = await db
    .select({ organizationId: organization.id })
    .from(publicKey)
    .innerJoin(organization, eq(organization.id, publicKey.organizationId))
    .where(
      and(
        eq(publicKey.key, token),
        eq(organization.slug, orgSlug),
        notExpired(publicKey.expiresAt),
      ),
    )
    .limit(1);

  if (!row) {
    throw new RestError(401, "Invalid API key");
  }
  return { organizationId: row.organizationId };
}
