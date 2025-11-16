exports.up = function (db, callback) {
  db.createTable(
    "collections",
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
      hero_image_url: {
        type: "string",
        length: 500,
        notNull: false,
      },
      seo_title: {
        type: "string",
        length: 255,
        notNull: false,
      },
      seo_description: {
        type: "text",
        notNull: false,
      },
      is_active: {
        type: "boolean",
        notNull: true,
        defaultValue: true,
      },
      sort_order: {
        type: "int",
        notNull: false,
        defaultValue: 0,
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
      db.addIndex("collections", "collections_slug_idx", ["slug"], callback);
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("collections", callback);
};

