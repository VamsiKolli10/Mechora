exports.up = function (db, callback) {
  db.createTable(
    "shipments",
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
          name: "shipments_order_id_fk",
          table: "orders",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      tracking_number: {
        type: "string",
        length: 255,
        notNull: false,
        unique: true,
      },
      carrier: {
        type: "string",
        length: 100,
        notNull: false,
      },
      status: {
        type: "string",
        length: 50,
        notNull: true,
        defaultValue: "pending",
      }, // pending, label_created, in_transit, delivered, exception
      shipped_at: {
        type: "timestamp",
        notNull: false,
      },
      delivered_at: {
        type: "timestamp",
        notNull: false,
      },
      estimated_delivery: {
        type: "timestamp",
        notNull: false,
      },
      shipping_address: {
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
      db.addIndex("shipments", "shipments_order_id_idx", ["order_id"], (err) => {
        if (err) return callback(err);
        db.addIndex("shipments", "shipments_tracking_number_idx", ["tracking_number"], (err) => {
          if (err) return callback(err);
          db.addIndex("shipments", "shipments_status_idx", ["status"], callback);
        });
      });
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("shipments", callback);
};

