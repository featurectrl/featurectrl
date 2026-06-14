import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "@/db";
import { withActiveOrganization } from "@/db/with-active-organization";
import { fastify } from "@/server";
import { createTestApiKey } from "@/tests/fixtures/api-key";
import { createTestOrganization } from "@/tests/fixtures/organization";
import { createTestPublicKey } from "@/tests/fixtures/public-key";
import { getFeatureFlagsWithValue, publishApp } from "./helpers.requests";

describe("authentication", () => {
  const ctx = {} as {
    organizationId: string;
    orgSlug: string;
    privateApiKey: string;
    publicApiKey: string;
    expiredPrivateApiKey: string;
    expiredPublicApiKey: string;
    // A second, unrelated organization the keys above do NOT belong to.
    otherOrgSlug: string;
  };

  beforeEach(async () => {
    await db.transaction(async (tx) => {
      const organization = await createTestOrganization(tx);

      await withActiveOrganization(tx, organization.id);

      const apiKey = await createTestApiKey(tx, { organizationId: organization.id });
      const publicKey = await createTestPublicKey(tx, { organizationId: organization.id });

      const expired = new Date(Date.now() - 1000);
      const expiredApiKey = await createTestApiKey(tx, {
        organizationId: organization.id,
        expiresAt: expired,
      });
      const expiredPublicKey = await createTestPublicKey(tx, {
        organizationId: organization.id,
        expiresAt: expired,
      });

      const otherOrganization = await createTestOrganization(tx);

      ctx.organizationId = organization.id;
      ctx.orgSlug = organization.slug;
      ctx.privateApiKey = apiKey.key;
      ctx.publicApiKey = publicKey.key;
      ctx.expiredPrivateApiKey = expiredApiKey.key;
      ctx.expiredPublicApiKey = expiredPublicKey.key;
      ctx.otherOrgSlug = otherOrganization.slug;
    });
  });

  describe("POST /api/:orgSlug/apps (private key)", () => {
    const payload = { app: "x", flags: {}, segments: [] };

    test("401 when Authorization header is missing", async () => {
      const response = await fastify.inject(
        publishApp({ orgSlug: ctx.orgSlug, apiKey: undefined, payload }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 for an unknown private key", async () => {
      const response = await fastify.inject(
        publishApp({ orgSlug: ctx.orgSlug, apiKey: "sk_unknown", payload }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 when a public key is used instead of a private key", async () => {
      const response = await fastify.inject(
        publishApp({ orgSlug: ctx.orgSlug, apiKey: ctx.publicApiKey, payload }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 when a valid key is used against a different org's slug", async () => {
      const response = await fastify.inject(
        publishApp({ orgSlug: ctx.otherOrgSlug, apiKey: ctx.privateApiKey, payload }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 when an expired private key is used", async () => {
      const response = await fastify.inject(
        publishApp({ orgSlug: ctx.orgSlug, apiKey: ctx.expiredPrivateApiKey, payload }),
      );
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/:orgSlug/public/flags/:environmentName (public key)", () => {
    const environmentName = "prod";

    test("401 when Authorization header is missing", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({ orgSlug: ctx.orgSlug, environmentName, apiKey: undefined }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 for an unknown public key", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({ orgSlug: ctx.orgSlug, environmentName, apiKey: "pk_unknown" }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 when a private key is used instead of a public key", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({
          orgSlug: ctx.orgSlug,
          environmentName,
          apiKey: ctx.privateApiKey,
        }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 when a valid key is used against a different org's slug", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({
          orgSlug: ctx.otherOrgSlug,
          environmentName,
          apiKey: ctx.publicApiKey,
        }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 when an expired public key is used", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({
          orgSlug: ctx.orgSlug,
          environmentName,
          apiKey: ctx.expiredPublicApiKey,
        }),
      );
      expect(response.statusCode).toBe(401);
    });
  });
});
