exports.up = function (db, callback) {
  db.createTable(
    "inventory_adjustments",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      watch_id: {
        type: "int",
        notNull: true,
        foreignKey: {
          name: "inventory_adjustments_watch_id_fk",
          table: "watches",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      adjustment_type: {
        type: "string",
        length: 50,
        notNull: true,
      }, // 'sale', 'return', 'damage', 'restock', 'adjustment'
      quantity_change: {
        type: "int",
        notNull: true,
      },
      previous_quantity: {
        type: "int",
        notNull: true,
      },
      new_quantity: {
        type: "int",
        notNull: true,
      },
      reason: {
        type: "text",
        notNull: false,
      },
      reference_id: {
        type: "int",
        notNull: false,
      }, // Reference to order_id or other entity
      reference_type: {
        type: "string",
        length: 50,
        notNull: false,
      }, // 'order', 'return', 'adjustment'
      created_by: {
        type: "int",
        notNull: false,
        foreignKey: {
          name: "inventory_adjustments_created_by_fk",
          table: "users",
          rules: {
            onDelete: "SET NULL",
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
      db.addIndex("inventory_adjustments", "inventory_adjustments_watch_id_idx", ["watch_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("inventory_adjustments", "inventory_adjustments_created_at_idx", ["created_at"], callback);
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("inventory_adjustments", callback);
};

