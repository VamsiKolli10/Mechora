exports.up = function (db, callback) {
  db.createTable(
    "cart_items",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      cart_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "cart_items_cart_id_fk",
          table: "carts",
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
          name: "cart_items_watch_id_fk",
          table: "watches",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      quantity: {
        type: "int",
        notNull: true,
        defaultValue: 1,
      },
      price_at_added: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
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
      db.addIndex("cart_items", "cart_items_cart_id_idx", ["cart_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("cart_items", "cart_items_watch_id_idx", ["watch_id"], callback);
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("cart_items", callback);
};

