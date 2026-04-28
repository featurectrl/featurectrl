import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { db } from "@/db";
import { auth } from "../auth";

function toHeaders(raw: Record<string, string | string[] | undefined>): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }
  return headers;
}

export async function createContext({ req }: CreateFastifyContextOptions) {
  const session = await auth.api.getSession({ headers: toHeaders(req.headers) });
  const activeOrganizationId = session?.session.activeOrganizationId ?? null;

  return {
    db,
    session: session?.session ?? null,
    user: session?.user ?? null,
    activeOrganizationId,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
