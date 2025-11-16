# Testing Guide

## Setup

1. Create a test database:
```bash
createdb watchs_co_test
```

2. Copy `.env.test.example` to `.env.test` and update with your test database credentials:
```bash
cp .env.test.example .env.test
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
│       └── passwordValidator.test.js
└── integration/             # Integration tests
    ├── auth.test.js
    └── health.test.js
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

    expect(response.body).toHaveProperty("token");
  });
});
```

## Test Database

- Tests use a separate test database (`watchs_co_test`)
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

Tests should be run in CI/CD pipeline before deployment. Add to your CI configuration:

```yaml
- name: Run tests
  run: npm test
```

