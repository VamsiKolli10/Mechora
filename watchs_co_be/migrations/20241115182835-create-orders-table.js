exports.up = function (db, callback) {
  db.createTable(
    "orders",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      order_number: {
        type: "string",
        length: 50,
        notNull: true,
        unique: true,
      },
      user_id: {
        type: "int",
        notNull: false,
        foreignKey: {
          name: "orders_user_id_fk",
          table: "users",
          rules: {
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      guest_email: {
        type: "string",
        length: 255,
        notNull: false,
      },
      status: {
        type: "string",
        length: 50,
        notNull: true,
        defaultValue: "pending",
      }, // pending, confirmed, processing, shipped, delivered, cancelled, refunded
      subtotal: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
      },
      tax_amount: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
        defaultValue: 0,
      },
      shipping_amount: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
        defaultValue: 0,
      },
      total_amount: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
      },
      shipping_address: {
        type: "jsonb",
        notNull: false,
      },
      billing_address: {
        type: "jsonb",
        notNull: false,
      },
      notes: {
        type: "text",
        notNull: false,
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
      db.addIndex("orders", "orders_order_number_idx", ["order_number"], (err) => {
        if (err) return callback(err);
        db.addIndex("orders", "orders_user_id_idx", ["user_id"], (err) => {
          if (err) return callback(err);
          db.addIndex("orders", "orders_status_idx", ["status"], (err) => {
            if (err) return callback(err);
            db.addIndex("orders", "orders_created_at_idx", ["created_at"], callback);
          });
        });
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("orders", callback);
};

