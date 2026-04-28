import { uuid } from "drizzle-orm/pg-core";
import { organization } from "@/db/schema/auth";

export const organizationFk = () =>
  uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" });
