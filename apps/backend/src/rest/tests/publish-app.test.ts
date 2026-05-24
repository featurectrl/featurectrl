import { beforeEach, describe, expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  app,
  appFeatureFlagConnection,
  appUserSegmentConnection,
  featureFlag,
  userSegment,
} from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { fastify } from "@/server";
import { createTestApiKey } from "@/tests/fixtures/api-key";
import { createTestOrganization } from "@/tests/fixtures/organization";
import { publishApp } from "./helpers.requests";

describe("POST /api/apps/publish", () => {
  const ctx = {} as {
    organizationId: string;
    privateApiKey: string;
  };

  beforeEach(async () => {
    await db.transaction(async (tx) => {
      const organization = await createTestOrganization(tx);

      await withActiveOrganization(tx, organization.id);

      const apiKey = await createTestApiKey(tx, { organizationId: organization.id });

      ctx.organizationId = organization.id;
      ctx.privateApiKey = apiKey.privateKey;
    });
  });

  test("publishing new app - creates app, flags, segments, and their connections", async () => {
    const response = await fastify.inject(
      publishApp({
        apiKey: ctx.privateApiKey,
        payload: {
          app: "my-app",
          flags: {
            "new-checkout": { defaultValue: { enabled: false } },
            "dark-mode": { defaultValue: { enabled: true }, description: "Dark theme" },
          },
          segments: ["beta-users"],
        },
      }),
    );

    expect(response.statusCode).toBe(200);

    const body = response.json() as {
      ok: true;
      app: { id: string; name: string };
      flags: { id: string; name: string }[];
      segments: { id: string; name: string }[];
    };

    expect(body.ok).toBe(true);
    expect(body.app.name).toBe("my-app");
    expect(body.flags.map((f) => f.name).sort()).toEqual(["dark-mode", "new-checkout"]);
    expect(body.segments.map((s) => s.name)).toEqual(["beta-users"]);

    await db.transaction(async (tx) => {
      await withActiveOrganization(tx, ctx.organizationId);

      const apps = await tx.select().from(app);
      expect(apps).toHaveLength(1);
      expect(apps[0].name).toBe("my-app");

      const flags = await tx.select().from(featureFlag);
      expect(flags.map((f) => f.name).sort()).toEqual(["dark-mode", "new-checkout"]);
      expect(flags.find((f) => f.name === "dark-mode")?.description).toBe("Dark theme");

      const segments = await tx.select().from(userSegment);
      expect(segments.map((s) => s.name)).toEqual(["beta-users"]);

      const flagConnections = await tx
        .select()
        .from(appFeatureFlagConnection)
        .where(eq(appFeatureFlagConnection.appId, body.app.id));
      expect(flagConnections).toHaveLength(2);

      const segmentConnections = await tx
        .select()
        .from(appUserSegmentConnection)
        .where(eq(appUserSegmentConnection.appId, body.app.id));
      expect(segmentConnections).toHaveLength(1);
    });
  });

  test("re-publishing app replaces connections (adds new, drops removed)", async () => {
    const first = await fastify.inject(
      publishApp({
        apiKey: ctx.privateApiKey,
        payload: {
          app: "my-app",
          flags: {
            "flag-a": { defaultValue: { enabled: true } },
            "flag-b": { defaultValue: { enabled: false } },
          },
          segments: [],
        },
      }),
    );
    expect(first.statusCode).toBe(200);
    const appId = (first.json() as { app: { id: string } }).app.id;

    const second = await fastify.inject(
      publishApp({
        apiKey: ctx.privateApiKey,
        payload: {
          app: "my-app",
          flags: {
            "flag-b": { defaultValue: { enabled: false } },
            "flag-c": { defaultValue: { enabled: true } },
          },
          segments: [],
        },
      }),
    );
    expect(second.statusCode).toBe(200);

    await db.transaction(async (tx) => {
      await withActiveOrganization(tx, ctx.organizationId);
      const flagsForApp = await tx
        .select({ name: featureFlag.name })
        .from(featureFlag)
        .innerJoin(
          appFeatureFlagConnection,
          and(
            eq(appFeatureFlagConnection.featureFlagId, featureFlag.id),
            eq(appFeatureFlagConnection.appId, appId),
          ),
        );
      expect(flagsForApp.map((f) => f.name).sort()).toEqual(["flag-b", "flag-c"]);
    });
  });

  test("returns 400 when for malformed body", async () => {
    const response = await fastify.inject(
      publishApp({
        apiKey: ctx.privateApiKey,
        payload: {},
      }),
    );
    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty("error");
  });
});
