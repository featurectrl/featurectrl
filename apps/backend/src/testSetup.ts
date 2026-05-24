// Preloaded by `bun test` (see package.json).
process.env.NODE_ENV = "test";
process.env.ORIGIN = "http://localhost:5173";
process.env.BFF_API_ORIGIN = "http://localhost:3000/_";
process.env.REST_API_ORIGIN = "http://localhost:3000/api";
process.env.BETTER_AUTH_SECRET = "test-secret-not-used-in-production";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.EMAIL_FROM = "no-reply@featurectrl.io";
process.env.EMAIL_BACKEND_URL = "console://";
process.env.GITHUB_CLIENT_ID = "";
process.env.GITHUB_CLIENT_SECRET = "";
process.env.GOOGLE_CLIENT_ID = "";
process.env.GOOGLE_CLIENT_SECRET = "";
process.env.DISABLE_RATE_LIMIT = "true";
