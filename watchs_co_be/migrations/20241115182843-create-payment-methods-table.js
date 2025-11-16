exports.up = function (db, callback) {
  db.createTable(
    "payment_methods",
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
          name: "payment_methods_user_id_fk",
          table: "users",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      type: {
        type: "string",
        length: 50,
        notNull: true,
      }, // 'card', 'paypal', 'bank_account', etc.
      provider: {
        type: "string",
        length: 50,
        notNull: false,
      }, // 'stripe', 'paypal', etc.
      provider_payment_method_id: {
        type: "string",
        length: 255,
        notNull: false,
      },
      last4: {
        type: "string",
        length: 4,
        notNull: false,
      },
      brand: {
        type: "string",
        length: 50,
        notNull: false,
      }, // 'visa', 'mastercard', etc.
      expiry_month: {
        type: "int",
        notNull: false,
      },
      expiry_year: {
        type: "int",
        notNull: false,
      },
      is_default: {
        type: "boolean",
        notNull: true,
        defaultValue: false,
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
      db.addIndex("payment_methods", "payment_methods_user_id_idx", ["user_id"], callback);
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("payment_methods", callback);
};

