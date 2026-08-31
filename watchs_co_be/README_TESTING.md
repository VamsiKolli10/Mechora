# Testing Guide

## Setup

1. Create a separate test database or Supabase test project:
```bash
createdb watchs_co_test
```

2. Configure the test database connection in the environment used by Jest. For Supabase, set `DATABASE_URL` and `DB_SSL=true`:
```bash
export DATABASE_URL=postgresql://...
export DB_SSL=true
```

3. Install dependencies:
```bash
npm install
```

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

- Tests use a separate test database or Supabase test project
- Tests should clean up after themselves
- Use `beforeAll` and `afterAll` hooks for setup and teardown

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

Unit tests should run on every CI change. Integration tests should run when a disposable test database is available:

```yaml
- name: Run unit tests
  run: npm run test:unit -- --runInBand
```
