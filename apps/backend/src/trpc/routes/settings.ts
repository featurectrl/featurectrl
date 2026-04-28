import { env } from "@/env";
import { publicProcedure, router } from "../trpc";

export const settingsRoutes = router({
  get: publicProcedure.query(() => {
    const githubEnabled = !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
    const googleEnabled = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

    return {
      auth: {
        github: githubEnabled,
        google: googleEnabled,
        emailPassword: true as const,
      },
    };
  }),
});
