exports.up = function (db, callback) {
  db.createTable(
    "addresses",
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
          name: "addresses_user_id_fk",
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
        length: 20,
        notNull: true,
        defaultValue: "shipping",
      }, // 'shipping', 'billing', 'both'
      label: {
        type: "string",
        length: 100,
        notNull: false,
      }, // 'Home', 'Work', etc.
      name: {
        type: "string",
        length: 255,
        notNull: true,
      },
      street: {
        type: "string",
        length: 255,
        notNull: true,
      },
      street2: {
        type: "string",
        length: 255,
        notNull: false,
      },
      city: {
        type: "string",
        length: 100,
        notNull: true,
      },
      state: {
        type: "string",
        length: 100,
        notNull: true,
      },
      zip: {
        type: "string",
        length: 20,
        notNull: true,
      },
      country: {
        type: "string",
        length: 2,
        notNull: true,
        defaultValue: "US",
      },
      phone: {
        type: "string",
        length: 20,
        notNull: false,
      },
      is_default: {
        type: "boolean",
        notNull: true,
        defaultValue: false,
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
      db.addIndex("addresses", "addresses_user_id_idx", ["user_id"], callback);
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("addresses", callback);
};

