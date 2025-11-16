exports.up = function (db, callback) {
  const sql = `
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
  `;
  db.runSql(sql, callback);
};

exports.down = function (db, callback) {
  const sql = `
    ALTER TABLE users
      DROP COLUMN IF EXISTS deleted_at,
      DROP COLUMN IF EXISTS updated_at,
      DROP COLUMN IF EXISTS created_at
  `;
  db.runSql(sql, callback);
};
