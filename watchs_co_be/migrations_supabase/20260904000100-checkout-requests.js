exports.up = (db, callback) => db.runSql(`
  CREATE TABLE IF NOT EXISTS checkout_requests (
    owner_hash text NOT NULL,
    request_key varchar(128) NOT NULL,
    payload_hash text NOT NULL,
    order_id integer NOT NULL REFERENCES orders(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (owner_hash, request_key)
  );
  ALTER TABLE checkout_requests ENABLE ROW LEVEL SECURITY;
`, callback);

exports.down = (_db, callback) => callback(new Error(
  "Checkout retry records must be retained; use a forward migration."
));
