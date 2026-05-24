import type { InjectOptions } from "fastify";
import { env } from "@/env";

export function getFeatureFlagsWithValue({
  environmentName,
  apiKey,
}: {
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
    url: `/api/public/environment/${environmentName}`,
    headers,
  } satisfies InjectOptions;
}

export function publishApp({
  apiKey,
  payload,
}: {
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
    url: "/api/apps/publish",
    headers,
    payload,
  };
}
