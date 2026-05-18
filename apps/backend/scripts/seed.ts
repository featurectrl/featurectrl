import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  app,
  appFeatureFlagConnection,
  appUserSegmentConnection,
  environment,
  type FeatureFlagValue,
  featureFlag,
  featureFlagValue,
  member,
  user,
  userSegment,
} from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";

type AskOptions = { default?: string; env?: string; required?: boolean };

function ask(label: string, opts: AskOptions = {}): string {
  const fromEnv = opts.env ? process.env[opts.env]?.trim() : undefined;
  if (fromEnv) return fromEnv;
  const suffix = opts.default ? ` [${opts.default}]` : "";
  const answer = prompt(`${label}${suffix}:`)?.trim();
  if (answer) return answer;
  if (opts.default !== undefined) return opts.default;
  if (opts.required ?? true) {
    console.error(`✗ ${label} is required`);
    process.exit(1);
  }
  return "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FAKE_MEMBERS = [
  { name: "Alice Anderson", email: "alice@example.com", role: "admin" },
  { name: "Bob Brown", email: "bob@example.com", role: "member" },
  { name: "Carol Chen", email: "carol@example.com", role: "member" },
] as const;

const SEGMENTS = ["dev", "staff", "beta-users", "internal"] as const;

type SeedFlag = {
  name: string;
  description: string;
  defaultFor: (segments: Map<string, string>) => FeatureFlagValue;
};

const FLAGS: SeedFlag[] = [
  {
    name: "new-checkout",
    description: "New checkout flow rollout",
    defaultFor: () => ({ enabled: false }),
  },
  {
    name: "onboarding-v2",
    description: "Refreshed onboarding wizard",
    defaultFor: (segments) => ({
      enabled: true,
      disabled: { segments: [segments.get("dev") ?? ""] },
    }),
  },
  {
    name: "dark-mode",
    description: "Dark theme toggle",
    defaultFor: (segments) => ({
      enabled: { segments: [segments.get("beta-users") ?? ""] },
    }),
  },
];

async function main() {
  const email = ask("Admin email", { env: "DB_SEED_EMAIL" });
  const password = ask("Admin password", { env: "DB_SEED_PASSWORD" });
  const orgName = ask("Organization name", {
    env: "DB_SEED_ORG_NAME",
    default: "Acme Inc",
  });
  const orgSlug = ask("Organization slug", {
    env: "DB_SEED_ORG_SLUG",
    default: slugify(orgName),
  });
  const adminName = email.split("@")[0] ?? "admin";

  const signUp = await auth.api.signUpEmail({
    body: { email, password, name: adminName },
  });
  const adminUserId = signUp.user.id;
  console.log(`✓ created admin user ${email}`);

  const org = await auth.api.createOrganization({
    body: { name: orgName, slug: orgSlug, userId: adminUserId },
  });
  if (!org) {
    console.error("✗ failed to create organization");
    process.exit(1);
  }
  const orgId = org.id;
  console.log(`✓ created organization ${orgName} (${orgSlug})`);

  for (const m of FAKE_MEMBERS) {
    const fakeUserId = uuidv7();
    await db.insert(user).values({
      id: fakeUserId,
      name: m.name,
      email: m.email,
      emailVerified: true,
    });
    await db.insert(member).values({
      id: uuidv7(),
      organizationId: orgId,
      userId: fakeUserId,
      role: m.role,
    });
  }
  console.log(`✓ added ${FAKE_MEMBERS.length} fake members`);

  await db.transaction(async (tx) => {
    await withActiveOrganization(tx, orgId);

    const envs = await tx.select().from(environment).where(eq(environment.organizationId, orgId));
    const production = envs.find((e) => e.name === "production");
    if (!envs.find((e) => e.name === "staging") || !production) {
      throw new Error("expected staging and production environments to exist");
    }

    const segmentRows = SEGMENTS.map((name) => ({
      id: uuidv7(),
      organizationId: orgId,
      name,
    }));
    await tx.insert(userSegment).values(segmentRows);

    const segmentIdByName = new Map(segmentRows.map((s) => [s.name, s.id]));

    const flagRows = FLAGS.map((f) => ({
      id: uuidv7(),
      organizationId: orgId,
      name: f.name,
      description: f.description,
      defaultValue: f.defaultFor(segmentIdByName),
    }));
    await tx.insert(featureFlag).values(flagRows);

    const darkMode = flagRows.find((f) => f.name === "dark-mode");
    if (darkMode) {
      await tx.insert(featureFlagValue).values({
        organizationId: orgId,
        featureFlagId: darkMode.id,
        environmentId: production.id,
        value: { enabled: false },
      });
    }

    const wiredApp = { id: uuidv7(), organizationId: orgId, name: "Web App" };
    const bareApp = { id: uuidv7(), organizationId: orgId, name: "Mobile App" };
    await tx.insert(app).values([wiredApp, bareApp]);

    await tx.insert(appFeatureFlagConnection).values(
      flagRows.map((f) => ({
        appId: wiredApp.id,
        featureFlagId: f.id,
        organizationId: orgId,
      })),
    );
    await tx.insert(appUserSegmentConnection).values(
      segmentRows.map((s) => ({
        appId: wiredApp.id,
        userSegmentId: s.id,
        organizationId: orgId,
      })),
    );

    console.log(
      `✓ seeded ${SEGMENTS.length} segments, ${FLAGS.length} flags, 2 apps (Web App wired, Mobile App bare)`,
    );
  });

  console.log(`\nDone.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
