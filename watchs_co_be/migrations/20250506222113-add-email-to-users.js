exports.up = function (db, callback) {
  db.addColumn(
    "users",
    "email",
    {
      type: "string",
      length: 255,
      notNull: true,
      unique: true,
      defaultValue: "",
    },
    callback
  );
};

exports.down = function (db, callback) {
  db.removeColumn("users", "email", callback);
};
