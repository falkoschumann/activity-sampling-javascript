export PORT=3000
export DEV_PORT=8080

# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
# TODO remove --experimental-vm-modules when Jest supports ESM
export NODE_OPTIONS=--experimental-global-customevent --experimental-vm-modules --no-warnings=ExperimentalWarning
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

start-desktop: build
	npm run start --workspace @activity-sampling/desktop

dev:
	npx concurrently \
		"npm run dev --workspace @activity-sampling/webserver" \
		"npm run dev --workspace @activity-sampling/webclient" \
		"npm run dev --workspace @activity-sampling/desktop"

test: build
	npm test

unit-tests: build
	npx jest --testPathPattern=".*\/unit\/.*"

integration-tests: build
	npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: build
	npx jest --testPathPattern=".*\/e2e\/.*"

watch: build
	npx jest --watch

coverage: build
	npx jest --coverage

build: version
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	else \
		npm install; \
	fi
	npm run build

version:
	@echo "Use Node.js $(shell node --version)"
	@echo "Use NPM $(shell npm --version)"

.PHONY: all clean distclean dist check format start start-desktop dev \
	test unit-tests integration-tests e2e-tests watch coverage \
	build version
