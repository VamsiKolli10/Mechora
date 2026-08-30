try {
  require("dotenv").config();
} catch (err) {
  // Allow running the script without installed dependencies.
}

const crypto = require("crypto");
const logger = require("../utils/logger");
const {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/mailer");

const recipient =
  process.argv[2] ||
  process.env.EMAIL_TEST_TO ||
  "test@example.com";

const randomToken = () => crypto.randomBytes(24).toString("hex");

const run = async () => {
  try {
    await sendEmailVerificationEmail(recipient, randomToken());
    await sendPasswordResetEmail(recipient, randomToken());
    logger.info(`Test emails queued for ${recipient}`);
  } catch (err) {
    logger.error("Failed to send test emails:", err.message);
    process.exitCode = 1;
  }
};

run();
