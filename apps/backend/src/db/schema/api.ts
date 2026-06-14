import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizationFk } from "./fields/organization";

// RLS intentionally isn't enabled on these tables: the key itself is the auth
// token, looked up by the exact match without an org context. tRPC routes that
// touch these tables must filter by organizationId explicitly.
export const apiKey = pgTable("api_key", {
  id: uuid("id").primaryKey(),
  organizationId: organizationFk(),
  displayName: text("display_name").notNull(),
  hashedKey: text("hashed_key").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Public keys: safe to expose, stored as a plaintext value and revealable any time.
export const publicKey = pgTable("public_key", {
  id: uuid("id").primaryKey(),
  organizationId: organizationFk(),
  displayName: text("display_name").notNull(),
  key: text("key").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
