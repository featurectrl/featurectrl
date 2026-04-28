.PHONY: install install-backend install-web dev dev-backend dev-web \
        build build-backend build-web build-types \
        lint lint-backend lint-web format format-backend format-web \
        check-types check-types-backend check-types-web \
        db-seed db-reset docker-standalone

.SILENT:

BACKEND = 2>&1 | awk '{ print "[backend] " $$0; fflush() }'
WEB     = 2>&1 | awk '{ print "[web] " $$0; fflush() }'

install:
	$(MAKE) -j2 install-backend install-web

install-backend:
	cd apps/backend && bun install $(BACKEND)

install-web:
	cd apps/web && bun install $(WEB)

build-types:
	cd apps/backend && bun run build-types $(BACKEND)

dev: build-types
	$(MAKE) -j2 dev-backend dev-web

dev-backend:
	cd apps/backend && bun run dev $(BACKEND)

dev-web:
	cd apps/web && bun run dev $(WEB)

build: build-types
	$(MAKE) -j2 build-backend build-web

build-backend:
	cd apps/backend && bun run build $(BACKEND)

build-web:
	cd apps/web && bun run build $(WEB)

lint:
	$(MAKE) -j2 lint-backend lint-web

lint-backend:
	cd apps/backend && bun run lint $(BACKEND)

lint-web:
	cd apps/web && bun run lint $(WEB)

format:
	$(MAKE) -j2 format-backend format-web

format-backend:
	cd apps/backend && bun run format $(BACKEND)

format-web:
	cd apps/web && bun run format $(WEB)

check-types: build-types
	$(MAKE) -j2 check-types-backend check-types-web

check-types-backend:
	cd apps/backend && bun run check-types $(BACKEND)

check-types-web:
	cd apps/web && bun run check-types $(WEB)

db-seed:
	cd apps/backend && bun run db:seed $(BACKEND)

db-reset:
	cd apps/backend && bun run db:reset $(BACKEND)

build-docker-images:
	tools/build-docker-standalone.sh
