import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "@/db";
import { withActiveOrganization } from "@/db/with-active-organization";
import { fastify } from "@/server";
import { createTestApiKey } from "@/tests/fixtures/api-key";
import { createTestOrganization } from "@/tests/fixtures/organization";
import { getFeatureFlagsWithValue, publishApp } from "./helpers.requests";

describe("authentication", () => {
  const ctx = {} as {
    organizationId: string;
    privateApiKey: string;
    publicApiKey: string;
  };

  beforeEach(async () => {
    await db.transaction(async (tx) => {
      const organization = await createTestOrganization(tx);

      await withActiveOrganization(tx, organization.id);

      const apiKey = await createTestApiKey(tx, { organizationId: organization.id });

      ctx.organizationId = organization.id;
      ctx.privateApiKey = apiKey.privateKey;
      ctx.publicApiKey = apiKey.publicKey;
    });
  });

  describe("POST /api/apps/publish (private key)", () => {
    const payload = { app: "x", flags: {}, segments: [] };

    test("401 when Authorization header is missing", async () => {
      const response = await fastify.inject(publishApp({ apiKey: undefined, payload }));
      expect(response.statusCode).toBe(401);
    });

    test("401 for an unknown private key", async () => {
      const response = await fastify.inject(publishApp({ apiKey: "sk_unknown", payload }));
      expect(response.statusCode).toBe(401);
    });

    test("401 when a public key is used instead of a private key", async () => {
      const response = await fastify.inject(publishApp({ apiKey: ctx.publicApiKey, payload }));
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/public/environment/:name (public key)", () => {
    const environmentName = "prod";

    test("401 when Authorization header is missing", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({ environmentName, apiKey: undefined }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 for an unknown public key", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({ environmentName, apiKey: "pk_unknown" }),
      );
      expect(response.statusCode).toBe(401);
    });

    test("401 when a private key is used instead of a public key", async () => {
      const response = await fastify.inject(
        getFeatureFlagsWithValue({ environmentName, apiKey: ctx.privateApiKey }),
      );
      expect(response.statusCode).toBe(401);
    });
  });
});
