exports.up = function (db, callback) {
  db.createTable(
    "order_items",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      order_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "order_items_order_id_fk",
          table: "orders",
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
          name: "order_items_watch_id_fk",
          table: "watches",
          rules: {
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      quantity: {
        type: "int",
        notNull: true,
      },
      unit_price: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
      },
      total_price: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
      },
      watch_snapshot: {
        type: "jsonb",
        notNull: false,
      }, // Store watch details at time of purchase
      created_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("CURRENT_TIMESTAMP"),
      },
    },
    (err) => {
      if (err) return callback(err);
      db.addIndex("order_items", "order_items_order_id_idx", ["order_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("order_items", "order_items_watch_id_idx", ["watch_id"], callback);
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("order_items", callback);
};

