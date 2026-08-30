const fs = require("fs");
const path = require("path");

const schemaPath = path.resolve(__dirname, "..", "schema.sql");

exports.up = function (db, callback) {
  db.runSql("SELECT to_regclass('public.users') AS users_table", (checkError, result) => {
    if (checkError) return callback(checkError);
    if (result.rows[0]?.users_table) return callback();

    const schema = fs
      .readFileSync(schemaPath, "utf8")
      .replace(/^BEGIN;\s*/i, "")
      .replace(/\s*COMMIT;\s*$/i, "");
    return db.runSql(schema, callback);
  });
};

// The bootstrap is intentionally immutable. Use reviewed migrations instead
// of dropping production data when rolling back later changes.
exports.down = function (db, callback) {
  callback(new Error("The Supabase bootstrap migration is immutable."));
};
