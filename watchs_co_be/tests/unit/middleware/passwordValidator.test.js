const { validatePassword } = require("../../../middleware/passwordValidator");

describe("Password Validator", () => {
  test("should reject passwords shorter than 8 characters", () => {
    const errors = validatePassword("Short1!");
    expect(errors).toContain("Password must be at least 8 characters long");
  });

  test("should reject passwords without lowercase letters", () => {
    const errors = validatePassword("PASSWORD123!");
    expect(errors).toContain("Password must contain at least one lowercase letter");
  });

  test("should reject passwords without uppercase letters", () => {
    const errors = validatePassword("password123!");
    expect(errors).toContain("Password must contain at least one uppercase letter");
  });

  test("should reject passwords without numbers", () => {
    const errors = validatePassword("Password!");
    expect(errors).toContain("Password must contain at least one number");
  });

  test("should reject passwords without special characters", () => {
    const errors = validatePassword("Password123");
    expect(errors).toContain("Password must contain at least one special character");
  });

  test("should reject common passwords", () => {
    const errors = validatePassword("password123");
    expect(errors).toContain("Password is too common, please choose a stronger password");
  });

  test("should accept valid passwords", () => {
    const errors = validatePassword("ValidPassword123!");
    expect(errors).toHaveLength(0);
  });

  test("should reject empty passwords", () => {
    const errors = validatePassword("");
    expect(errors).toContain("Password is required");
  });

  test("should reject null passwords", () => {
    const errors = validatePassword(null);
    expect(errors).toContain("Password is required");
  });
});

