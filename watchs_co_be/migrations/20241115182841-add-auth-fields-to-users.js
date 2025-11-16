exports.up = function (db, callback) {
  // Add refresh token field
  db.addColumn("users", "refresh_token", {
    type: "string",
    length: 500,
    notNull: false,
  }, (err) => {
    if (err) return callback(err);
    
    // Add password reset token
    db.addColumn("users", "password_reset_token", {
      type: "string",
      length: 500,
      notNull: false,
    }, (err) => {
      if (err) return callback(err);
      
      // Add password reset token expiry
      db.addColumn("users", "password_reset_expires", {
        type: "timestamp",
        notNull: false,
      }, (err) => {
        if (err) return callback(err);
        
        // Add email verification token
        db.addColumn("users", "email_verification_token", {
          type: "string",
          length: 500,
          notNull: false,
        }, (err) => {
          if (err) return callback(err);
          
          // Add email verified flag
          db.addColumn("users", "email_verified", {
            type: "boolean",
            notNull: true,
            defaultValue: false,
          }, (err) => {
            if (err) return callback(err);
            
            // Add MFA secret (for TOTP)
            db.addColumn("users", "mfa_secret", {
              type: "string",
              length: 500,
              notNull: false,
            }, (err) => {
              if (err) return callback(err);
              
              // Add MFA enabled flag
              db.addColumn("users", "mfa_enabled", {
                type: "boolean",
                notNull: true,
                defaultValue: false,
              }, (err) => {
                if (err) return callback(err);
                
                // Add failed login attempts
                db.addColumn("users", "failed_login_attempts", {
                  type: "int",
                  notNull: true,
                  defaultValue: 0,
                }, (err) => {
                  if (err) return callback(err);
                  
                  // Add account locked until
                  db.addColumn("users", "locked_until", {
                    type: "timestamp",
                    notNull: false,
                  }, callback);
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
  db.removeColumn("users", "locked_until", (err) => {
    if (err) return callback(err);
    db.removeColumn("users", "failed_login_attempts", (err) => {
      if (err) return callback(err);
      db.removeColumn("users", "mfa_enabled", (err) => {
        if (err) return callback(err);
        db.removeColumn("users", "mfa_secret", (err) => {
          if (err) return callback(err);
          db.removeColumn("users", "email_verified", (err) => {
            if (err) return callback(err);
            db.removeColumn("users", "email_verification_token", (err) => {
              if (err) return callback(err);
              db.removeColumn("users", "password_reset_expires", (err) => {
                if (err) return callback(err);
                db.removeColumn("users", "password_reset_token", (err) => {
                  if (err) return callback(err);
                  db.removeColumn("users", "refresh_token", callback);
                });
              });
            });
          });
        });
      });
    });
  });
};

