import type { InjectOptions } from "fastify";
import { env } from "@/env";

export function getFeatureFlagsWithValue({
  orgSlug,
  environmentName,
  apiKey,
}: {
  orgSlug: string;
  environmentName: string;
  apiKey: string | undefined;
}): InjectOptions {
  const apiHost = new URL(env.REST_API_ORIGIN).host;
  const headers: Record<string, string> = { host: apiHost };
  if (apiKey !== undefined) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return {
    method: "GET",
    url: `/api/${orgSlug}/public/flags/${environmentName}`,
    headers,
  } satisfies InjectOptions;
}

export function publishApp({
  orgSlug,
  apiKey,
  payload,
}: {
  orgSlug: string;
  apiKey: string | undefined;
  payload: object;
}): InjectOptions {
  const apiHost = new URL(env.REST_API_ORIGIN).host;
  const headers: Record<string, string> = { host: apiHost };
  if (apiKey !== undefined) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return {
    method: "POST",
    url: `/api/${orgSlug}/apps`,
    headers,
    payload,
  };
}

export function listResource({
  orgSlug,
  resource,
  apiKey,
}: {
  orgSlug: string;
  resource: "apps" | "flags" | "segments";
  apiKey: string | undefined;
}): InjectOptions {
  const apiHost = new URL(env.REST_API_ORIGIN).host;
  const headers: Record<string, string> = { host: apiHost };
  if (apiKey !== undefined) {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return {
    method: "GET",
    url: `/api/${orgSlug}/${resource}`,
    headers,
  } satisfies InjectOptions;
}
