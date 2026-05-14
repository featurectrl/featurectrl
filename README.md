<p align="center">
  <img src="https://featurectrl.io/logo_full.svg" alt="featurectrl" width="320" />
</p>

<p align="center">
  <a href="https://github.com/featurectrl/featurectrl/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://img.shields.io/github/actions/workflow/status/featurectrl/featurectrl/ci.yml?branch=main&label=CI" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/built%20with-TypeScript-3178C6.svg" alt="Built with TypeScript" />
</p>

---

**featurectrl** is an open-source feature flag solution designed to make feature flags type safe yet simple.
Define flags in your code, toggle them per environment from a dashboard, and target subsets of users with segments.

> A hosted version is coming soon. For now, featurectrl is self-hosted.

## Features

- Feature flags with optional segment-based targeting
- User segments for targeted rollouts
- Feature flags are defined in code and uploaded via SDK or REST API

## Quickstart

Pull and run the standalone Docker image.

### 1. Run the migrations

Run this once before the first start and on every upgrade. It connects to your database and applies pending schema
migrations, then exits.

```sh
docker run --rm \
  -e DATABASE_URL=postgres://user:password@host:5432/featurectrl \
  featurectrl/featurectrl:latest db:migrate
```

### 2. Start the server

```sh
docker run -d --name featurectrl \
  -p 3000:3000 \
  -e ORIGIN=http://localhost:3000 \
  -e DATABASE_URL=postgres://user:password@host:5432/featurectrl \
  -e BETTER_AUTH_SECRET="replace-with-32-byte-random-secret" \
  featurectrl/featurectrl:latest
```

Open `http://localhost:3000` and sign up.

### 3. ... or with `docker compose`

```yaml
services:
  db:
    image: postgres:alpine
    environment:
      POSTGRES_USER: featurectrl
      POSTGRES_PASSWORD: featurectrl
      POSTGRES_DB: featurectrl
    volumes:
      - featurectrl-db:/var/lib/postgresql/data

  migrate:
    image: featurectrl/featurectrl:latest
    command: [ "db:migrate" ]
    environment:
      DATABASE_URL: postgres://featurectrl:featurectrl@db:5432/featurectrl
    depends_on:
      db:
        condition: service_healthy
    restart: "no"

  app:
    image: featurectrl/featurectrl:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://featurectrl:featurectrl@db:5432/featurectrl
      BETTER_AUTH_SECRET: replace-with-32-byte-random-secret
      ORIGIN: http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    restart: unless-stopped

volumes:
  featurectrl-db:
```

Open <http://localhost:3000>, create the first account, and you're in.

## Environment variables

| Variable                                    | Required | Default | Description                                                                        |
|---------------------------------------------|----------|---------|------------------------------------------------------------------------------------|
| `ORIGIN`                                    | yes      | —       | Public origin where the app is reachable (e.g. `https://flags.example.com`).       |
| `DATABASE_URL`                              | yes      | —       | Postgres connection string, e.g. `postgres://user:password@host:5432/featurectrl`. |
| `BETTER_AUTH_SECRET`                        | yes      | —       | 32-byte random value used for sessions.                                            |
| `PORT`                                      | no       | `3000`  | Port the server listens on inside the container.                                   |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | no       | —       | Set both to enable GitHub OAuth on the login page.                                 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no       | —       | Set both to enable Google OAuth on the login page.                                 |

## SDKs

| Language                | Repository    |
|-------------------------|---------------|
| JavaScript / TypeScript | `Coming soon` |
| Python                  | `Coming soon` |
| Go                      | `Coming soon` |

## Local development

You need [Bun](https://bun.sh), Docker (for Postgres), and Node 24.

```bash
git clone git@github.com:featurectrl/featurectrl.git
cd featurectrl
cp .env.example .env
# edit .env file - add missing and replace placeholder values
make install
make dev
```

The dev command runs the backend and the web app in parallel with prefixed logs.

Useful Make targets:

| Command                    | What it does                              |
|----------------------------|-------------------------------------------|
| `make dev`                 | Run backend + web in parallel             |
| `make build`               | Build both apps for production            |
| `make lint`                | Lint both apps with Biome                 |
| `make format`              | Auto-format both apps                     |
| `make check-types`         | Type-check both apps                      |
| `make db-seed`             | Seed the database with sample data        |
| `make db-reset`            | Drop and recreate the database            |
| `make build-docker-images` | Build the standalone Docker image locally |

## Project structure

```
apps/
  backend/          Backend app with backend-for-fronted API (tRPC + Better Auth) and public REST API for SDKs
  web/              Web application
docker/             Docker images
tools/              Development scripts
Makefile            Dev commands
.env.example        .env template
```

## Contributing

Contributions are welcome. For anything non-trivial, please open an issue first so we can align on a direction. Before
opening a PR, run `make lint` and `make check-types`.

## License

[MIT](LICENSE)
