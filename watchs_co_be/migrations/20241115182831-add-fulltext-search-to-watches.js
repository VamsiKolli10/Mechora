exports.up = function (db, callback) {
  // Create a full-text search index on watches
  const query = `
    CREATE INDEX IF NOT EXISTS watches_fts_idx ON watches 
    USING gin(to_tsvector('english', 
      COALESCE(brand, '') || ' ' || 
      COALESCE(model, '') || ' ' || 
      COALESCE(reference, '') || ' ' || 
      COALESCE(complication, '') || ' ' || 
      COALESCE(description, '')
    ));
  `;
  
  db.runSql(query, callback);
};

exports.down = function (db, callback) {
  db.runSql("DROP INDEX IF EXISTS watches_fts_idx;", callback);
};

