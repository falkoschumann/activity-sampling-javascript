export NODE_OPTIONS=--experimental-vm-modules --no-warnings=ExperimentalWarning

all: dist test check

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

unit-tests: prepare
	@npx jest --testPathPattern=".*\/unit\/.*"

integration-tests: prepare
	@npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: prepare
	@npx jest --testPathPattern=".*\/e2e\/.*"

watch: prepare
	@npx jest --watch

coverage: prepare
	@npx jest --coverage

check:
	@npx prettier . --check
	@npx eslint */src */tests

format:
	@npx prettier . --write
	@npx eslint --fix */src */tests

prepare:
	@if [ -n "$(CI)" ] ; then \
		npm ci; \
	elif [ ! -d "node_modules" ] ; then \
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
