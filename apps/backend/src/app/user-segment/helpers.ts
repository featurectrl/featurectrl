import type { InferSelectModel } from "drizzle-orm";
import type { app } from "@/db/schema";

export function isUserSegmentUnused(row: {
  appConnections: {
    app: Pick<InferSelectModel<typeof app>, "id" | "archivedAt">;
  }[];
}) {
  return row.appConnections.every((conn) => conn.app.archivedAt !== null);
}
