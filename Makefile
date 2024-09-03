export PORT=3000
export DEV_PORT=8080

# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
# TODO remove --experimental-vm-modules when Jest supports ESM
export NODE_OPTIONS=--experimental-global-customevent --experimental-vm-modules
export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf coverage
	rm -rf packages/*/dist
	rm -rf packages/*/out
	rm -rf packages/*/.vite

distclean: clean
	rm -rf node_modules
	rm -rf packages/*/node_modules

dist: build

check: test
	npx prettier . --check
	npx eslint packages/*/src packages/*/test

format:
	npx prettier . --write
	npx eslint --fix packages/*/src packages/*/test

start: build
	npm run start --workspace @activity-sampling/webserver

start-desktop: prepare
	npm run start --workspace @activity-sampling/desktop

start-desktop2: prepare
	npm run start --workspace @activity-sampling/desktop2

# TODO Do not run desktop in dev mode, because hot reload is not working
dev: prepare
	npx concurrently \
		"npm run dev --workspace @activity-sampling/webserver" \
		"npm run dev --workspace @activity-sampling/webclient" \
		"npm run dev --workspace @activity-sampling/desktop2"

test: prepare
	npm test

unit-tests: prepare
	npx jest --testPathPattern=".*\/unit\/.*"

integration-tests:
	npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: prepare
	npx jest --testPathPattern=".*\/e2e\/.*"

watch: prepare
	npx jest --watch

coverage: prepare
	npx jest --coverage

build: prepare
	npm run build

prepare: version
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	else \
		npm install; \
	fi

version:
	@echo "Use Node.js $(shell node --version)"
	@echo "Use NPM $(shell npm --version)"

.PHONY: all clean distclean dist check format start start-desktop dev \
	test unit-tests integration-tests e2e-tests watch coverage \
	build prepare version
