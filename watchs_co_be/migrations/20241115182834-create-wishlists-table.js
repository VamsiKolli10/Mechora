exports.up = function (db, callback) {
  db.createTable(
    "wishlists",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      user_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "wishlists_user_id_fk",
          table: "users",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      watch_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "wishlists_watch_id_fk",
          table: "watches",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      created_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("CURRENT_TIMESTAMP"),
      },
    },
    (err) => {
      if (err) return callback(err);
      db.addIndex("wishlists", "wishlists_user_id_idx", ["user_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("wishlists", "wishlists_watch_id_idx", ["watch_id"], (err) => {
          if (err) return callback(err);
          // Unique constraint: user can only have one wishlist entry per watch
          db.addIndex("wishlists", "wishlists_user_watch_unique_idx", ["user_id", "watch_id"], {
            unique: true,
          }, callback);
        });
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("wishlists", callback);
};

