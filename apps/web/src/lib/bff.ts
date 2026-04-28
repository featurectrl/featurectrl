if (!import.meta.env.PUBLIC_BFF_API_URL) {
  throw new Error("Missing backend configuration");
}

export const BFF_API_URL = `${new URL(import.meta.env.PUBLIC_BFF_API_URL, location.origin)}`;

export const BETTER_AUTH_API_URL = `${BFF_API_URL}/auth`;
export const TRPC_API_URL = `${BFF_API_URL}/trpc`;
