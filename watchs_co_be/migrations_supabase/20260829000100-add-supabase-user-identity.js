const applicationTables = [
  "users", "brands", "collections", "watches", "assets",
  "inventory_adjustments", "carts", "cart_items", "wishlists",
  "orders", "order_items", "payments", "shipments",
  "order_status_events", "recently_viewed", "addresses", "payment_methods",
];

exports.up = function (db, callback) {
  const enableRls = applicationTables
    .map((table) => `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`)
    .join("\n");

  db.runSql(
    `ALTER TABLE public.users
       ADD COLUMN IF NOT EXISTS supabase_user_id uuid;
     CREATE UNIQUE INDEX IF NOT EXISTS users_supabase_user_id_unique
       ON public.users (supabase_user_id)
       WHERE supabase_user_id IS NOT NULL;
     ${enableRls}`,
    callback
  );
};

exports.down = function (db, callback) {
  // RLS stays enabled on rollback because disabling it would expose Data API
  // tables to browser roles. Only the identity link is reverted.
  db.runSql(
    `DROP INDEX IF EXISTS public.users_supabase_user_id_unique;
     ALTER TABLE public.users DROP COLUMN IF EXISTS supabase_user_id;`,
    callback
  );
};
