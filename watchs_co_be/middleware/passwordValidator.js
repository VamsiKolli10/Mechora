// Password validation middleware

const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return errors;
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check for common passwords (basic check)
  const commonPasswords = [
    "password",
    "password123",
    "12345678",
    "qwerty",
    "abc123",
    "letmein",
    "welcome",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common, please choose a stronger password");
  }

  return errors;
};

const passwordValidator = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  const errors = validatePassword(password);

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Password validation failed",
      details: errors,
    });
  }

  next();
};

module.exports = {
  validatePassword,
  passwordValidator,
};

