const fs = require("fs/promises");
const path = require("path");
const logger = require("./logger");

const normalizeBaseUrl = (value) => {
  if (!value) return null;
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const resolveAppBaseUrl = () => {
  const explicit =
    process.env.APP_BASE_URL ||
    process.env.PUBLIC_APP_URL ||
    process.env.FRONTEND_URL;
  if (explicit) {
    return normalizeBaseUrl(explicit);
  }

  const clientOrigin = process.env.CLIENT_ORIGIN;
  if (clientOrigin) {
    const firstOrigin = clientOrigin.split(",")[0]?.trim();
    return normalizeBaseUrl(firstOrigin);
  }

  return "http://localhost:5173";
};

const joinUrl = (base, resourcePath) => {
  if (!base) return resourcePath;
  if (base.endsWith("/") && resourcePath.startsWith("/")) {
    return `${base}${resourcePath.slice(1)}`;
  }
  if (!base.endsWith("/") && !resourcePath.startsWith("/")) {
    return `${base}/${resourcePath}`;
  }
  return `${base}${resourcePath}`;
};

const resolveOutboxPath = () => {
  const outboxPath = process.env.EMAIL_OUTBOX_PATH;
  if (outboxPath) {
    return outboxPath;
  }
  return path.join(process.cwd(), "outbox");
};

const deliveryMode = (process.env.EMAIL_DELIVERY || "log").toLowerCase();
const defaultFrom = process.env.EMAIL_FROM || "Mechora <no-reply@mechora.local>";

const sendViaLog = async ({ to, subject, text, html }) => {
  logger.info(`[email] delivery=log to=${to} subject="${subject}"`);
  logger.info(`[email] text=${text}`);
  if (html) {
    logger.info(`[email] html=${html}`);
  }
};

const sendViaFile = async ({ to, subject, text, html }) => {
  const outboxPath = resolveOutboxPath();
  await fs.mkdir(outboxPath, { recursive: true });
  const payload = {
    to,
    subject,
    text,
    html,
    from: defaultFrom,
    sent_at: new Date().toISOString(),
  };
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.json`;
  await fs.writeFile(
    path.join(outboxPath, filename),
    JSON.stringify(payload, null, 2)
  );
  logger.info(`[email] delivery=file path=${path.join(outboxPath, filename)}`);
};

const sendViaSmtp = async ({ to, subject, text, html }) => {
  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (err) {
    throw new Error("SMTP delivery requires nodemailer. Install it to continue.");
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error("SMTP_HOST is required for SMTP delivery.");
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  await transport.sendMail({
    from: defaultFrom,
    to,
    subject,
    text,
    html,
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const payload = { to, subject, text, html };

  if (deliveryMode === "log") {
    return sendViaLog(payload);
  }
  if (deliveryMode === "file") {
    return sendViaFile(payload);
  }
  if (deliveryMode === "smtp") {
    return sendViaSmtp(payload);
  }

  throw new Error(`Unsupported EMAIL_DELIVERY mode: ${deliveryMode}`);
};

const sendEmailVerificationEmail = async (email, token) => {
  const baseUrl = resolveAppBaseUrl();
  const verifyPath = process.env.EMAIL_VERIFY_PATH || "/verify-email";
  const verifyUrl = `${joinUrl(baseUrl, verifyPath)}?token=${encodeURIComponent(
    token
  )}`;

  const subject = "Verify your Mechora email";
  const text = [
    "Welcome to Mechora.",
    `Verify your email: ${verifyUrl}`,
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Welcome to Mechora.</p>
    <p><a href="${verifyUrl}">Verify your email</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendPasswordResetEmail = async (email, token) => {
  const baseUrl = resolveAppBaseUrl();
  const resetPath = process.env.PASSWORD_RESET_PATH || "/password-reset";
  const resetUrl = `${joinUrl(baseUrl, resetPath)}?token=${encodeURIComponent(
    token
  )}`;

  const subject = "Reset your Mechora password";
  const text = [
    "We received a request to reset your password.",
    `Reset your password: ${resetUrl}`,
    "This link expires in 1 hour.",
  ].join("\n");

  const html = `
    <p>We received a request to reset your password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour.</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
};
