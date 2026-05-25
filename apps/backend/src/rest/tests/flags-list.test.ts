import { beforeEach, describe, expect, test } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import { db } from "@/db";
import { featureFlag } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { fastify } from "@/server";
import { createTestApiKey } from "@/tests/fixtures/api-key";
import { createTestOrganization } from "@/tests/fixtures/organization";
import { listResource } from "./helpers.requests";

type ListResponse = {
  items: {
    id: string;
    name: string;
    description: string | null;
    defaultValue: { enabled: unknown };
    createdAt: string;
  }[];
  meta: { total: number };
};

describe("GET /api/flags", () => {
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

      await tx.insert(featureFlag).values([
        {
          id: uuidv7(),
          organizationId: organization.id,
          name: "dark-mode",
          description: "Dark theme",
          defaultValue: { enabled: true },
        },
        {
          id: uuidv7(),
          organizationId: organization.id,
          name: "new-checkout",
          description: null,
          defaultValue: { enabled: false },
        },
        {
          id: uuidv7(),
          organizationId: organization.id,
          name: "z-archived-flag",
          defaultValue: { enabled: true },
          archivedAt: new Date(),
        },
      ]);

      ctx.organizationId = organization.id;
      ctx.privateApiKey = apiKey.privateKey;
      ctx.publicApiKey = apiKey.publicKey;
    });
  });

  test("returns active flags with their definition fields, sorted by name", async () => {
    const response = await fastify.inject(
      listResource({ resource: "flags", apiKey: ctx.privateApiKey }),
    );

    expect(response.statusCode).toBe(200);
    const body = response.json() as ListResponse;

    expect(body.items.map((f) => f.name)).toEqual(["dark-mode", "new-checkout"]);
    expect(body.meta.total).toBe(body.items.length);
    expect(body.meta.total).toBe(2);

    const darkMode = body.items.find((f) => f.name === "dark-mode");
    expect(darkMode?.description).toBe("Dark theme");
    expect(darkMode?.defaultValue).toEqual({ enabled: true });
  });

  test("excludes archived flags", async () => {
    const body = (
      await fastify.inject(listResource({ resource: "flags", apiKey: ctx.privateApiKey }))
    ).json() as ListResponse;
    expect(body.items.some((item) => item.name.startsWith("z-archived"))).toBe(false);
  });

  test("rejects the public API key with 401", async () => {
    const response = await fastify.inject(
      listResource({ resource: "flags", apiKey: ctx.publicApiKey }),
    );
    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty("error");
  });

  test("rejects a missing Authorization header with 401", async () => {
    const response = await fastify.inject(listResource({ resource: "flags", apiKey: undefined }));
    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty("error");
  });
});
