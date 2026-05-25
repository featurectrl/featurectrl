import { beforeEach, describe, expect, test } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import { db } from "@/db";
import { app } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { fastify } from "@/server";
import { createTestApiKey } from "@/tests/fixtures/api-key";
import { createTestOrganization } from "@/tests/fixtures/organization";
import { listResource } from "./helpers.requests";

type ListResponse = {
  items: { id: string; name: string; createdAt: string; updatedAt: string }[];
  meta: { total: number };
};

describe("GET /api/apps", () => {
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

      await tx.insert(app).values([
        { id: uuidv7(), organizationId: organization.id, name: "alpha" },
        { id: uuidv7(), organizationId: organization.id, name: "bravo" },
        {
          id: uuidv7(),
          organizationId: organization.id,
          name: "z-archived-app",
          archivedAt: new Date(),
        },
      ]);

      ctx.organizationId = organization.id;
      ctx.privateApiKey = apiKey.privateKey;
      ctx.publicApiKey = apiKey.publicKey;
    });
  });

  test("returns active apps in the pagination envelope, sorted by name", async () => {
    const response = await fastify.inject(
      listResource({ resource: "apps", apiKey: ctx.privateApiKey }),
    );

    expect(response.statusCode).toBe(200);
    const body = response.json() as ListResponse;

    expect(body.items.map((a) => a.name)).toEqual(["alpha", "bravo"]);
    expect(body.meta.total).toBe(body.items.length);
    expect(body.meta.total).toBe(2);
    for (const item of body.items) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("createdAt");
      expect(item).toHaveProperty("updatedAt");
    }
  });

  test("excludes archived apps", async () => {
    const body = (
      await fastify.inject(listResource({ resource: "apps", apiKey: ctx.privateApiKey }))
    ).json() as ListResponse;
    expect(body.items.some((item) => item.name.startsWith("z-archived"))).toBe(false);
  });

  test("rejects the public API key with 401", async () => {
    const response = await fastify.inject(
      listResource({ resource: "apps", apiKey: ctx.publicApiKey }),
    );
    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty("error");
  });

  test("rejects a missing Authorization header with 401", async () => {
    const response = await fastify.inject(listResource({ resource: "apps", apiKey: undefined }));
    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty("error");
  });
});
