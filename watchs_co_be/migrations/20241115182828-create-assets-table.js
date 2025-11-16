exports.up = function (db, callback) {
  db.createTable(
    "assets",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      watch_id: {
        type: "int",
        notNull: false,
        foreignKey: {
          name: "assets_watch_id_fk",
          table: "watches",
          rules: {
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          mapping: "id",
        },
      },
      url: {
        type: "string",
        length: 1000,
        notNull: true,
      },
      type: {
        type: "string",
        length: 50,
        notNull: true,
      }, // 'image', 'video', '360', 'thumbnail'
      alt_text: {
        type: "string",
        length: 500,
        notNull: false,
      },
      sort_order: {
        type: "int",
        notNull: false,
        defaultValue: 0,
      },
      width: {
        type: "int",
        notNull: false,
      },
      height: {
        type: "int",
        notNull: false,
      },
      file_size: {
        type: "bigint",
        notNull: false,
      },
      mime_type: {
        type: "string",
        length: 100,
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
      db.addIndex("assets", "assets_watch_id_idx", ["watch_id"], callback);
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("assets", callback);
};

