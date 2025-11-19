exports.up = function (db, callback) {
  db.addColumn(
    "users",
    "role",
    {
      type: "string",
      length: 50,
      notNull: true,
      defaultValue: "customer",
    },
    callback
  );
};

exports.down = function (db, callback) {
  db.removeColumn("users", "role", callback);
};
