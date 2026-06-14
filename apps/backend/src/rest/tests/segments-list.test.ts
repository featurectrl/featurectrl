import { beforeEach, describe, expect, test } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import { db } from "@/db";
import { userSegment } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { fastify } from "@/server";
import { createTestApiKey } from "@/tests/fixtures/api-key";
import { createTestOrganization } from "@/tests/fixtures/organization";
import { listResource } from "./helpers.requests";

type ListResponse = {
  items: { id: string; name: string; createdAt: string }[];
  meta: { total: number };
};

describe("GET /api/segments", () => {
  const ctx = {} as {
    organizationId: string;
    orgSlug: string;
    privateApiKey: string;
    publicApiKey: string;
  };

  beforeEach(async () => {
    await db.transaction(async (tx) => {
      const organization = await createTestOrganization(tx);
      await withActiveOrganization(tx, organization.id);

      const apiKey = await createTestApiKey(tx, { organizationId: organization.id });

      await tx.insert(userSegment).values([
        { id: uuidv7(), organizationId: organization.id, name: "beta-users" },
        { id: uuidv7(), organizationId: organization.id, name: "internal" },
        {
          id: uuidv7(),
          organizationId: organization.id,
          name: "z-archived-segment",
          archivedAt: new Date(),
        },
      ]);

      ctx.organizationId = organization.id;
      ctx.orgSlug = organization.slug;
      ctx.privateApiKey = apiKey.privateKey;
      ctx.publicApiKey = apiKey.publicKey;
    });
  });

  test("returns active segments in the pagination envelope, sorted by name", async () => {
    const response = await fastify.inject(
      listResource({ orgSlug: ctx.orgSlug, resource: "segments", apiKey: ctx.privateApiKey }),
    );

    expect(response.statusCode).toBe(200);
    const body = response.json() as ListResponse;

    expect(body.items.map((s) => s.name)).toEqual(["beta-users", "internal"]);
    expect(body.meta.total).toBe(body.items.length);
    expect(body.meta.total).toBe(2);
    for (const item of body.items) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("createdAt");
    }
  });

  test("excludes archived segments", async () => {
    const body = (
      await fastify.inject(
        listResource({ orgSlug: ctx.orgSlug, resource: "segments", apiKey: ctx.privateApiKey }),
      )
    ).json() as ListResponse;
    expect(body.items.some((item) => item.name.startsWith("z-archived"))).toBe(false);
  });

  test("rejects the public API key with 401", async () => {
    const response = await fastify.inject(
      listResource({ orgSlug: ctx.orgSlug, resource: "segments", apiKey: ctx.publicApiKey }),
    );
    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty("error");
  });

  test("rejects a missing Authorization header with 401", async () => {
    const response = await fastify.inject(
      listResource({ orgSlug: ctx.orgSlug, resource: "segments", apiKey: undefined }),
    );
    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty("error");
  });
});
