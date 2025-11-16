exports.up = function (db, callback) {
  db.createTable(
    "payments",
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
          name: "payments_order_id_fk",
          table: "orders",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      payment_intent_id: {
        type: "string",
        length: 255,
        notNull: false,
        unique: true,
      },
      payment_method: {
        type: "string",
        length: 50,
        notNull: true,
      }, // card, wallet, ach, etc.
      amount: {
        type: "decimal",
        precision: 10,
        scale: 2,
        notNull: true,
      },
      currency: {
        type: "string",
        length: 3,
        notNull: true,
        defaultValue: "USD",
      },
      status: {
        type: "string",
        length: 50,
        notNull: true,
        defaultValue: "pending",
      }, // pending, processing, succeeded, failed, refunded
      transaction_id: {
        type: "string",
        length: 255,
        notNull: false,
      },
      metadata: {
        type: "jsonb",
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
      db.addIndex("payments", "payments_order_id_idx", ["order_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("payments", "payments_payment_intent_id_idx", ["payment_intent_id"], (err) => {
          if (err) return callback(err);
          db.addIndex("payments", "payments_status_idx", ["status"], callback);
        });
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("payments", callback);
};

