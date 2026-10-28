# Testing Guide

## Setup

Use Node.js 22+ and a disposable local PostgreSQL database. Tests modify data and deliberately reject non-loopback hosts. External identity and email services are mocked.

```bash
npm install
createdb mechora_test
export NODE_ENV=test
export DB_HOST=127.0.0.1 DB_PORT=5432 DB_NAME=mechora_test
export DB_USER=your_local_postgres_user DB_PASSWORD= DB_SSL=false
export DATABASE_URL=postgresql://your_local_postgres_user@127.0.0.1:5432/mechora_test
npm run migrate
npm test -- --runInBand
```

Set test secrets using the defaults in `tests/setup.js` or supply your own test-only values. Never load production credentials. `DB_POOL_MAX=1` also exercises checkout and transaction paths with a single database connection.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run only unit tests
```bash
npm run test:unit
```

### Run only integration tests
```bash
npm run test:integration
```

## Test Structure

```
tests/
├── setup.js                 # Test setup and configuration
├── unit/                    # Unit tests
│   └── middleware/
│       ├── middleware tests
│       └── service tests
└── integration/             # Integration tests
    ├── auth.test.js
    ├── cart.test.js
    ├── health.test.js
    └── products.test.js
```

## Writing Tests

### Unit Tests
Unit tests should test individual functions or modules in isolation.

Example:
```javascript
const { validatePassword } = require("../../../middleware/passwordValidator");

describe("Password Validator", () => {
  test("should reject weak passwords", () => {
    const errors = validatePassword("weak");
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests
Integration tests should test API endpoints and database interactions.

Example:
```javascript
const request = require("supertest");
const app = require("../../app");

describe("Authentication API", () => {
  test("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Password123!" })
      .expect(200);

    expect(response.headers["set-cookie"]).toBeDefined();
  });
});
```

## Test Database

- Tests use a disposable local PostgreSQL database
- Tests should clean up after themselves
- Use `beforeAll` and `afterAll` hooks for fixtures. The custom Jest environment closes database pools after all cleanup hooks; do not close a pool inside a suite.

## Coverage

Run tests with coverage:
```bash
npm test
```

Coverage reports are generated in the `coverage/` directory.

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data after tests
3. **Descriptive names**: Use descriptive test names that explain what is being tested
4. **Arrange-Act-Assert**: Structure tests with clear arrange, act, and assert sections
5. **Mock external services**: Mock external APIs and services in tests
6. **Test edge cases**: Test both happy paths and error cases

## Continuous Integration

Unit tests should run on every CI change. The optional integration CI job provisions PostgreSQL 16 and runs migrations before the suite when `RUN_INTEGRATION_TESTS=true`. Unit tests run on every change:

```yaml
- name: Run unit tests
  run: npm run test:unit -- --runInBand
```
