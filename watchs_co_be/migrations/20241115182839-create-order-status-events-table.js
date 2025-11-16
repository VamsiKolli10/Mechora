exports.up = function (db, callback) {
  db.createTable(
    "order_status_events",
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
          name: "order_status_events_order_id_fk",
          table: "orders",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      status: {
        type: "string",
        length: 50,
        notNull: true,
      },
      previous_status: {
        type: "string",
        length: 50,
        notNull: false,
      },
      notes: {
        type: "text",
        notNull: false,
      },
      created_by: {
        type: "int",
        notNull: false,
        foreignKey: {
          name: "order_status_events_created_by_fk",
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
      db.addIndex("order_status_events", "order_status_events_order_id_idx", ["order_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("order_status_events", "order_status_events_created_at_idx", ["created_at"], callback);
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("order_status_events", callback);
};

