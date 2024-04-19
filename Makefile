# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
# TODO remove --experimental-global-webcrypto when Node.js 18 must not be supported anymore
# TODO remove --experimental-vm-modules when Jest supports ESM
export NODE_OPTIONS=--experimental-global-customevent --experimental-global-webcrypto --experimental-vm-modules --no-warnings=ExperimentalWarning
export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf coverage
	rm -rf packages/*/dist

distclean: clean
	rm -rf node_modules
	rm -rf packages/*/node_modules

dist: build

check: test e2e
	npx prettier . --check
	npx eslint packages/*/src packages/*/test

format:
	npx prettier . --write
	npx eslint --fix packages/*/src packages/*/test

start: build
	npm start

dev: build
	npx concurrently "npm run dev --workspace @activity-sampling/webserver" "npm run dev --workspace @activity-sampling/webclient"

dev-e2e: build
	npx cypress open

test: build e2e
	npm test

unit-tests: build
	npx jest --testPathPattern=".*\/unit\/.*"

integration-tests: build
	npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: build e2e
	npx jest --testPathPattern=".*\/e2e\/.*"

e2e: build
# Currently we don't run E2E tests through the GUI
#	npm start --workspace activity-sampling-server &
#	npx cypress run
#	kill `lsof -t -i:3000`

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

.PHONY: all clean distclean dist check start dev \
	test unit-tests integration-tests e2e-tests e2e watch coverage \
	build version
