import { sql } from "drizzle-orm";
import type { Tx } from "./client";

export async function withActiveOrganization(tx: Tx, organizationId: string): Promise<void> {
  await tx.execute(sql`select set_config('app.current_organization_id', ${organizationId}, true)`);
}
