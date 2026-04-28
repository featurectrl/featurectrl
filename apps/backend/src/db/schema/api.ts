import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizationFk } from "./fields/organization";

// RLS intentionally not enabled: the secret key itself is the auth token,
// looked up by exact match without an org context. tRPC routes that touch
// this table must filter by organizationId explicitly.
export const apiKey = pgTable("api_key", {
  id: uuid("id").primaryKey(),
  organizationId: organizationFk(),
  displayName: text("display_name").notNull(),
  publicKey: text("public_key").notNull().unique(),
  privateKey: text("private_key").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
