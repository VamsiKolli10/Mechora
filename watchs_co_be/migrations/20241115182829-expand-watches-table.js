exports.up = function (db, callback) {
  // Add brand_id foreign key
  db.addColumn("watches", "brand_id", {
    type: "int",
    notNull: false,
    foreignKey: {
      name: "watches_brand_id_fk",
      table: "brands",
      rules: {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      mapping: "id",
    },
  }, (err) => {
    if (err) return callback(err);
    
    // Add collection_id foreign key
    db.addColumn("watches", "collection_id", {
      type: "int",
      notNull: false,
      foreignKey: {
        name: "watches_collection_id_fk",
        table: "collections",
        rules: {
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        mapping: "id",
      },
    }, (err) => {
      if (err) return callback(err);
      
      // Add SKU
      db.addColumn("watches", "sku", {
        type: "string",
        length: 100,
        notNull: false,
        unique: true,
      }, (err) => {
        if (err) return callback(err);
        
        // Add slug
        db.addColumn("watches", "slug", {
          type: "string",
          length: 255,
          notNull: false,
          unique: true,
        }, (err) => {
          if (err) return callback(err);
          
          // Add pricing fields
          db.addColumn("watches", "msrp", {
            type: "decimal",
            precision: 10,
            scale: 2,
            notNull: false,
          }, (err) => {
            if (err) return callback(err);
            
            // Rename price to sale_price for clarity
            db.renameColumn("watches", "price", "sale_price", (err) => {
              if (err) return callback(err);
              
              // Add stock status
              db.addColumn("watches", "stock_status", {
                type: "string",
                length: 50,
                notNull: true,
                defaultValue: "in_stock",
              }, (err) => {
                if (err) return callback(err);
                
                // Add stock quantity
                db.addColumn("watches", "stock_quantity", {
                  type: "int",
                  notNull: false,
                  defaultValue: 0,
                }, (err) => {
                  if (err) return callback(err);
                  
                  // Add movement
                  db.addColumn("watches", "movement", {
                    type: "string",
                    length: 255,
                    notNull: false,
                  }, (err) => {
                    if (err) return callback(err);
                    
                    // Add condition
                    db.addColumn("watches", "condition", {
                      type: "string",
                      length: 50,
                      notNull: true,
                      defaultValue: "new",
                    }, (err) => {
                      if (err) return callback(err);
                      
                      // Add case size
                      db.addColumn("watches", "case_size", {
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        notNull: false,
                      }, (err) => {
                        if (err) return callback(err);
                        
                        // Add water resistance
                        db.addColumn("watches", "water_resistance", {
                          type: "string",
                          length: 50,
                          notNull: false,
                        }, (err) => {
                          if (err) return callback(err);
                          
                          // Add power reserve
                          db.addColumn("watches", "power_reserve", {
                            type: "string",
                            length: 50,
                            notNull: false,
                          }, (err) => {
                            if (err) return callback(err);
                            
                            // Add description
                            db.addColumn("watches", "description", {
                              type: "text",
                              notNull: false,
                            }, (err) => {
                              if (err) return callback(err);
                              
                              // Add short description
                              db.addColumn("watches", "short_description", {
                                type: "string",
                                length: 500,
                                notNull: false,
                              }, (err) => {
                                if (err) return callback(err);
                                
                                // Add is_active flag
                                db.addColumn("watches", "is_active", {
                                  type: "boolean",
                                  notNull: true,
                                  defaultValue: true,
                                }, (err) => {
                                  if (err) return callback(err);
                                  
                                  // Add is_featured flag
                                  db.addColumn("watches", "is_featured", {
                                    type: "boolean",
                                    notNull: true,
                                    defaultValue: false,
                                  }, (err) => {
                                    if (err) return callback(err);
                                    
                                    // Add audit columns
                                    db.addColumn("watches", "created_at", {
                                      type: "timestamp",
                                      notNull: true,
                                      defaultValue: new String("CURRENT_TIMESTAMP"),
                                    }, (err) => {
                                      if (err) return callback(err);
                                      
                                      db.addColumn("watches", "updated_at", {
                                        type: "timestamp",
                                        notNull: true,
                                        defaultValue: new String("CURRENT_TIMESTAMP"),
                                      }, (err) => {
                                        if (err) return callback(err);
                                        
                                        db.addColumn("watches", "deleted_at", {
                                          type: "timestamp",
                                          notNull: false,
                                        }, (err) => {
                                          if (err) return callback(err);
                                          
                                          // Add indexes
                                          db.addIndex("watches", "watches_slug_idx", ["slug"], (err) => {
                                            if (err) return callback(err);
                                            
                                            db.addIndex("watches", "watches_sku_idx", ["sku"], (err) => {
                                              if (err) return callback(err);
                                              
                                              db.addIndex("watches", "watches_brand_id_idx", ["brand_id"], (err) => {
                                                if (err) return callback(err);
                                                
                                                db.addIndex("watches", "watches_collection_id_idx", ["collection_id"], (err) => {
                                                  if (err) return callback(err);
                                                  
                                                  db.addIndex("watches", "watches_stock_status_idx", ["stock_status"], (err) => {
                                                    if (err) return callback(err);
                                                    
                                                    db.addIndex("watches", "watches_is_active_idx", ["is_active"], (err) => {
                                                      if (err) return callback(err);
                                                      
                                                      db.addIndex("watches", "watches_is_featured_idx", ["is_featured"], callback);
                                                    });
                                                  });
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

exports.down = function (db, callback) {
  // Remove indexes
  db.removeIndex("watches", "watches_is_featured_idx", (err) => {
    if (err) return callback(err);
    db.removeIndex("watches", "watches_is_active_idx", (err) => {
      if (err) return callback(err);
      db.removeIndex("watches", "watches_stock_status_idx", (err) => {
        if (err) return callback(err);
        db.removeIndex("watches", "watches_collection_id_idx", (err) => {
          if (err) return callback(err);
          db.removeIndex("watches", "watches_brand_id_idx", (err) => {
            if (err) return callback(err);
            db.removeIndex("watches", "watches_sku_idx", (err) => {
              if (err) return callback(err);
              db.removeIndex("watches", "watches_slug_idx", (err) => {
                if (err) return callback(err);
                
                // Remove columns in reverse order
                db.removeColumn("watches", "deleted_at", (err) => {
                  if (err) return callback(err);
                  db.removeColumn("watches", "updated_at", (err) => {
                    if (err) return callback(err);
                    db.removeColumn("watches", "created_at", (err) => {
                      if (err) return callback(err);
                      db.removeColumn("watches", "is_featured", (err) => {
                        if (err) return callback(err);
                        db.removeColumn("watches", "is_active", (err) => {
                          if (err) return callback(err);
                          db.removeColumn("watches", "short_description", (err) => {
                            if (err) return callback(err);
                            db.removeColumn("watches", "description", (err) => {
                              if (err) return callback(err);
                              db.removeColumn("watches", "power_reserve", (err) => {
                                if (err) return callback(err);
                                db.removeColumn("watches", "water_resistance", (err) => {
                                  if (err) return callback(err);
                                  db.removeColumn("watches", "case_size", (err) => {
                                    if (err) return callback(err);
                                    db.removeColumn("watches", "condition", (err) => {
                                      if (err) return callback(err);
                                      db.removeColumn("watches", "movement", (err) => {
                                        if (err) return callback(err);
                                        db.removeColumn("watches", "stock_quantity", (err) => {
                                          if (err) return callback(err);
                                          db.removeColumn("watches", "stock_status", (err) => {
                                            if (err) return callback(err);
                                            db.renameColumn("watches", "sale_price", "price", (err) => {
                                              if (err) return callback(err);
                                              db.removeColumn("watches", "msrp", (err) => {
                                                if (err) return callback(err);
                                                db.removeColumn("watches", "slug", (err) => {
                                                  if (err) return callback(err);
                                                  db.removeColumn("watches", "sku", (err) => {
                                                    if (err) return callback(err);
                                                    db.removeColumn("watches", "collection_id", (err) => {
                                                      if (err) return callback(err);
                                                      db.removeColumn("watches", "brand_id", callback);
                                                    });
                                                  });
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

