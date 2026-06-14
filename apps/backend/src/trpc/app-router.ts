import { apiKeysRoutes } from "./routes/api-keys";
import { appsRoutes } from "./routes/apps";
import { environmentsRoutes } from "./routes/environments";
import { featureFlagsRoutes } from "./routes/feature-flags";
import { publicKeysRoutes } from "./routes/public-keys";
import { segmentsRoutes } from "./routes/segments";
import { settingsRoutes } from "./routes/settings";
import { router } from "./trpc";

export const appRouter = router({
  settings: settingsRoutes,
  environments: environmentsRoutes,
  segments: segmentsRoutes,
  featureFlags: featureFlagsRoutes,
  apps: appsRoutes,
  apiKeys: apiKeysRoutes,
  publicKeys: publicKeysRoutes,
});

export type AppRouter = typeof appRouter;
