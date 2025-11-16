exports.up = function (db, callback) {
  db.createTable(
    "recently_viewed",
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
          name: "recently_viewed_user_id_fk",
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
      },
      watch_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "recently_viewed_watch_id_fk",
          table: "watches",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      viewed_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("CURRENT_TIMESTAMP"),
      },
    },
    (err) => {
      if (err) return callback(err);
      db.addIndex("recently_viewed", "recently_viewed_user_id_idx", ["user_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("recently_viewed", "recently_viewed_guest_token_idx", ["guest_token"], (err) => {
          if (err) return callback(err);
          db.addIndex("recently_viewed", "recently_viewed_watch_id_idx", ["watch_id"], (err) => {
            if (err) return callback(err);
            db.addIndex("recently_viewed", "recently_viewed_viewed_at_idx", ["viewed_at"], callback);
          });
        });
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("recently_viewed", callback);
};

