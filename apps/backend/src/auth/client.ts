import path from "node:path";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { db } from "@/db";
import { environment } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { env } from "@/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: path.join(env.BFF_API_ORIGIN, "auth"),
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.BACKEND_TRUSTED_ORIGINS,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[auth] password reset requested for ${user.email}: ${url}`);
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        console.log(`[auth] email change requested for ${user.email} → ${newEmail}: ${url}`);
      },
    },
  },
  socialProviders: {
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,

    github:
      env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          }
        : undefined,
  },
  advanced: {
    database: {
      generateId: ({ model }) => (model === "session" ? uuidv4() : uuidv7()),
    },
  },
  plugins: [
    organization({
      organizationHooks: {
        afterCreateOrganization: async ({ organization: org }) => {
          await db.transaction(async (tx) => {
            await withActiveOrganization(tx, org.id);
            await tx.insert(environment).values([
              {
                id: uuidv7(),
                organizationId: org.id,
                name: "staging",
                displayName: "Staging",
              },
              {
                id: uuidv7(),
                organizationId: org.id,
                name: "prod",
                displayName: "Production",
              },
            ]);
          });
        },
      },
    }),
  ],
});
