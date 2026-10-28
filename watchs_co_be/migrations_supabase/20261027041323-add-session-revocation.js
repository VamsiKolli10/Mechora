exports.up = (db, callback) => db.runSql(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0;
`, callback);

exports.down = (_db, callback) => callback(new Error(
  "Session revocation state must be retained; use a forward migration."
));
