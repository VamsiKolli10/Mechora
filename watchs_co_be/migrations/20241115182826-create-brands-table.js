exports.up = function (db, callback) {
  db.createTable(
    "brands",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
        notNull: true,
      },
      name: {
        type: "string",
        length: 255,
        notNull: true,
        unique: true,
      },
      slug: {
        type: "string",
        length: 255,
        notNull: true,
        unique: true,
      },
      description: {
        type: "text",
        notNull: false,
      },
      logo_url: {
        type: "string",
        length: 500,
        notNull: false,
      },
      website_url: {
        type: "string",
        length: 500,
        notNull: false,
      },
      is_active: {
        type: "boolean",
        notNull: true,
        defaultValue: true,
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
      deleted_at: {
        type: "timestamp",
        notNull: false,
      },
    },
    (err) => {
      if (err) return callback(err);
      db.addIndex("brands", "brands_slug_idx", ["slug"], callback);
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("brands", callback);
};

