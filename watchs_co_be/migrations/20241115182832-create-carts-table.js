exports.up = function (db, callback) {
  db.createTable(
    "carts",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      user_id: {
        type: "int",
        notNull: false,
        foreignKey: {
          name: "carts_user_id_fk",
          table: "users",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      guest_token: {
        type: "string",
        length: 255,
        notNull: false,
        unique: true,
      },
      created_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("CURRENT_TIMESTAMP"),
      },
    },
    (err) => {
      if (err) return callback(err);
      db.addIndex("carts", "carts_user_id_idx", ["user_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("carts", "carts_guest_token_idx", ["guest_token"], callback);
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("carts", callback);
};

