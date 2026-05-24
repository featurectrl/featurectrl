import { beforeEach, describe, expect, test } from "bun:test";
import { db } from "@/db";
import { withActiveOrganization } from "@/db/with-active-organization";
import { fastify } from "@/server";
import { createTestApiKey } from "@/tests/fixtures/api-key";
import { createTestEnvironments } from "@/tests/fixtures/environment";
import {
  createTestFeatureFlag,
  createTestFeatureFlags,
  setTestFeatureFlagValues,
} from "@/tests/fixtures/feature-flag";
import { createTestOrganization } from "@/tests/fixtures/organization";
import { getFeatureFlagsWithValue } from "./helpers.requests";

type ReadResponse = {
  featureFlags: { name: string; value: { enabled: unknown } }[];
};

describe("GET /api/public/environment/:environmentName", () => {
  const ctx = {} as {
    organizationId: string;
    environments: {
      production: { id: string; name: string };
      staging: { id: string; name: string };
    };
    publicApiKey: string;
  };

  beforeEach(async () => {
    await db.transaction(async (tx) => {
      const organization = await createTestOrganization(tx);

      await withActiveOrganization(tx, organization.id);

      const [prodEnv, stagingEnv] = await createTestEnvironments(tx, [
        {
          organizationId: organization.id,
          name: "prod",
        },

        {
          organizationId: organization.id,
          name: "staging",
        },
      ]);
      const apiKey = await createTestApiKey(tx, { organizationId: organization.id });

      ctx.organizationId = organization.id;
      ctx.environments = { production: prodEnv, staging: stagingEnv };
      ctx.publicApiKey = apiKey.publicKey;
    });
  });

  test("returns the default value when no per-environment override exists", async () => {
    const flag = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, ctx.organizationId);
      return await createTestFeatureFlag(tx, {
        organizationId: ctx.organizationId,
        defaultValue: { enabled: true },
      });
    });

    const response = await fastify.inject(
      getFeatureFlagsWithValue({
        environmentName: ctx.environments.production.name,
        apiKey: ctx.publicApiKey,
      }),
    );

    expect(response.statusCode).toBe(200);
    expect((response.json() as ReadResponse).featureFlags).toEqual([
      { name: flag.name, value: { enabled: true } },
    ]);
  });

  test("flag environment value wins; other environments still see the default", async () => {
    const flag = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, ctx.organizationId);

      const flag = await createTestFeatureFlag(tx, {
        organizationId: ctx.organizationId,
      });
      await setTestFeatureFlagValues(tx, {
        organizationId: ctx.organizationId,
        featureFlagId: flag.id,
        values: [{ environmentId: ctx.environments.production.id, value: { enabled: false } }],
      });

      return flag;
    });

    const prodRuntimeValue = (
      await fastify.inject(
        getFeatureFlagsWithValue({
          environmentName: ctx.environments.production.name,
          apiKey: ctx.publicApiKey,
        }),
      )
    ).json() as ReadResponse;

    expect(prodRuntimeValue.featureFlags).toEqual([
      {
        name: flag.name,
        value: { enabled: false },
      },
    ]);

    const staging = (
      await fastify.inject(
        getFeatureFlagsWithValue({
          environmentName: ctx.environments.staging.name,
          apiKey: ctx.publicApiKey,
        }),
      )
    ).json() as ReadResponse;

    expect(staging.featureFlags).toEqual([
      {
        name: flag.name,
        value: { enabled: true },
      },
    ]);
  });

  test("archived flags are excluded from the response", async () => {
    const [activeFlag, _archivedFlag] = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, ctx.organizationId);

      return await createTestFeatureFlags(tx, [
        { organizationId: ctx.organizationId },
        { organizationId: ctx.organizationId, archived: true },
      ]);
    });

    const body = (
      await fastify.inject(
        getFeatureFlagsWithValue({
          environmentName: ctx.environments.production.name,
          apiKey: ctx.publicApiKey,
        }),
      )
    ).json() as ReadResponse;

    expect(body.featureFlags.map((f) => f.name)).toEqual([activeFlag.name]);
  });

  test("returns 404 for an unknown environment", async () => {
    const response = await fastify.inject(
      getFeatureFlagsWithValue({
        environmentName: "does-not-exist",
        apiKey: ctx.publicApiKey,
      }),
    );
    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty("error");
  });
});
