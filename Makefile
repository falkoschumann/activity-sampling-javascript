export NODE_OPTIONS=--experimental-vm-modules --no-warnings=ExperimentalWarning

build: dist test check

clean:
	@npm run clean --workspaces --if-present

start: prepare
	@npm run start --workspace=activity-sampling-server

dev: prepare
	@concurrently "npm run dev --workspace=activity-sampling-web" "npm run dev --workspace=activity-sampling-server"

dist: prepare
	@npm run dist --workspaces --if-present

test: prepare
	@npx jest

test-unit: prepare
	@npx jest --testPathPattern=".*\/unit\/.*"

test-integration: prepare
	@npx jest --testPathPattern=".*\/integration\/.*"

test-e2e: prepare
	@npx jest --testPathPattern=".*\/e2e\/.*"

check:
	@npx prettier . --check
	@npx eslint */src */tests

format:
	@npx prettier . --write
	@npx eslint --fix */src */tests

prepare:
	@if [ -n "$(CI)" ] ; then \
		echo "Build in CI environment"; \
		npm ci; \
	elif [ ! -d "node_modules" ] ; then \
		echo "Install dependencies"; \
		npm install; \
	fi

.PHONY: build \
	clean \
	start \
	dev \
	dist \
	test \
	test-unit \
	test-integration \
	test-e2e \
	check \
	format \
	prepare
