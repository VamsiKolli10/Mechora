const { Pool } = require("pg");
// Tests must never fall back to the application's live credentials.
if (process.env.NODE_ENV !== "test") require("dotenv").config();

const useSsl = process.env.DB_SSL === "true";
const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME,
    };

// Only checked when a query is actually attempted, so unit tests that never
// touch the database (or mock everything above this module) aren't forced
// to have a local test database configured just to require this file.
const assertSafeTestTarget = () => {
  if (process.env.NODE_ENV !== "test") return;

  const { host, database } = process.env.DATABASE_URL
    ? (() => {
        let target;
        try {
          target = new URL(process.env.DATABASE_URL);
        } catch {
          return { host: null, database: null };
        }
        return { host: target.hostname, database: target.pathname.replace(/^\//, "") };
      })()
    : { host: process.env.DB_HOST, database: process.env.DB_NAME };

  const isLocalHost = ["127.0.0.1", "localhost", "::1", "[::1]"].includes(host);
  // Matches this repo's test database naming conventions (e.g. mechora_test,
  // watchs_co_test) rather than one hardcoded name.
  const isTestDatabase = typeof database === "string" && database.endsWith("_test");

  if (!isLocalHost || !isTestDatabase) {
    throw new Error(
      'Database tests require an explicitly configured local test database ' +
      '(host must be localhost/127.0.0.1/::1 and the database name must end with "_test").'
    );
  }
};

let pool = null;
let closing = null;
const getPool = () => {
  if (!pool) {
    assertSafeTestTarget();
    pool = new Pool({
      ...connection,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
      connectionTimeoutMillis: parseInt(
        process.env.DB_CONNECTION_TIMEOUT_MS || "10000",
        10
      ),
    });
    if (process.env.NODE_ENV === "test") {
      globalThis.__mechoraRegisterDatabaseCleanup?.(module.exports.close);
    }
  }
  return pool;
};

module.exports = {
  query: (text, params) => getPool().query(text, params),
  getClient: () => getPool().connect(),
  close: () => {
    if (!pool) return Promise.resolve();
    closing ||= pool.end();
    return closing;
  },
};
