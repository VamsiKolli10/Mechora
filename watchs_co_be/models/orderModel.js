const { query } = require("../db");

const resolveQuery = (client) =>
  client ? client.query.bind(client) : query;

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `ORD-${timestamp}-${random}`;
};

// Create order with items (transactional)
const createOrder = async (orderData, client = null) => {
  // Note: In production, you'd want to use a transaction client
  // For now, we'll use individual queries
  const dbQuery = resolveQuery(client);
  
  const {
    user_id,
    guest_email,
    subtotal,
    tax_amount = 0,
    shipping_amount = 0,
    shipping_address,
    billing_address,
    notes,
  } = orderData;

  const total_amount = subtotal + tax_amount + shipping_amount;
  const order_number = generateOrderNumber();

  // Create order
  const orderResult = await dbQuery(
    `INSERT INTO orders (
      order_number, user_id, guest_email, status,
      subtotal, tax_amount, shipping_amount, total_amount,
      shipping_address, billing_address, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      order_number,
      user_id || null,
      guest_email || null,
      "pending",
      subtotal,
      tax_amount,
      shipping_amount,
      total_amount,
      JSON.stringify(shipping_address),
      JSON.stringify(billing_address),
      notes || null,
    ]
  );

  const order = orderResult.rows[0];

  // Add order status event
  await dbQuery(
    `INSERT INTO order_status_events (order_id, status, notes)
     VALUES ($1, $2, $3)`,
    [order.id, "pending", "Order created"]
  );

  return order;
};

// Add items to order
const addOrderItems = async (orderId, items, client = null) => {
  const dbQuery = resolveQuery(client);
  const orderItems = [];

  for (const item of items) {
    const { watch_id, quantity, unit_price, watch_snapshot } = item;
    const total_price = unit_price * quantity;

    const result = await dbQuery(
      `INSERT INTO order_items (
        order_id, watch_id, quantity, unit_price, total_price, watch_snapshot
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        orderId,
        watch_id,
        quantity,
        unit_price,
        total_price,
        watch_snapshot ? JSON.stringify(watch_snapshot) : null,
      ]
    );

    orderItems.push(result.rows[0]);
  }

  return orderItems;
};

// Get order by ID
const getOrderById = async (orderId, userId = null) => {
  let sql = `
    SELECT 
      o.*,
      u.name as user_name,
      u.email as user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.id = $1
  `;
  const params = [orderId];

  if (userId) {
    sql += " AND (o.user_id = $2 OR o.user_id IS NULL)";
    params.push(userId);
  }

  const orderResult = await query(sql, params);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  // Parse JSON fields
  if (order.shipping_address) {
    order.shipping_address = typeof order.shipping_address === "string"
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;
  }
  if (order.billing_address) {
    order.billing_address = typeof order.billing_address === "string"
      ? JSON.parse(order.billing_address)
      : order.billing_address;
  }

  // Get order items
  const itemsResult = await query(
    `SELECT 
      oi.*,
      w.brand,
      w.model,
      w.reference,
      w.slug,
      b.name as brand_name
    FROM order_items oi
    JOIN watches w ON oi.watch_id = w.id
    LEFT JOIN brands b ON w.brand_id = b.id
    WHERE oi.order_id = $1
    ORDER BY oi.created_at ASC`,
    [orderId]
  );

  order.items = itemsResult.rows.map((item) => {
    if (item.watch_snapshot) {
      item.watch_snapshot = typeof item.watch_snapshot === "string"
        ? JSON.parse(item.watch_snapshot)
        : item.watch_snapshot;
    }
    return item;
  });

  // Get payments
  const paymentsResult = await query(
    "SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at ASC",
    [orderId]
  );
  order.payments = paymentsResult.rows;

  // Get shipments
  const shipmentsResult = await query(
    "SELECT * FROM shipments WHERE order_id = $1 ORDER BY created_at ASC",
    [orderId]
  );
  order.shipments = shipmentsResult.rows.map((shipment) => {
    if (shipment.shipping_address) {
      shipment.shipping_address = typeof shipment.shipping_address === "string"
        ? JSON.parse(shipment.shipping_address)
        : shipment.shipping_address;
    }
    return shipment;
  });

  // Get status events
  const eventsResult = await query(
    `SELECT 
      ose.*,
      u.name as created_by_name
    FROM order_status_events ose
    LEFT JOIN users u ON ose.created_by = u.id
    WHERE ose.order_id = $1
    ORDER BY ose.created_at ASC`,
    [orderId]
  );
  order.status_events = eventsResult.rows;

  return order;
};

// Get order by order number
const getOrderByOrderNumber = async (orderNumber, userId = null) => {
  let sql = "SELECT * FROM orders WHERE order_number = $1";
  const params = [orderNumber];

  if (userId) {
    sql += " AND (user_id = $2 OR user_id IS NULL)";
    params.push(userId);
  }

  const result = await query(sql, params);
  if (result.rows.length === 0) {
    return null;
  }

  return await getOrderById(result.rows[0].id, userId);
};

// Get user orders
const getUserOrders = async (userId, options = {}) => {
  const { page = 1, limit = 20, status } = options;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT * FROM orders 
    WHERE user_id = $1
  `;
  const params = [userId];

  if (status) {
    sql += " AND status = $2";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
  params.push(limit, offset);

  const result = await query(sql, params);

  // Get total count
  let countSql = "SELECT COUNT(*) as total FROM orders WHERE user_id = $1";
  const countParams = [userId];
  if (status) {
    countSql += " AND status = $2";
    countParams.push(status);
  }
  const countResult = await query(countSql, countParams);

  return {
    orders: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
};

// Update order status
const updateOrderStatus = async (orderId, newStatus, previousStatus = null, notes = null, createdBy = null) => {
  const result = await query(
    `UPDATE orders 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [newStatus, orderId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  // Add status event
  await query(
    `INSERT INTO order_status_events (order_id, status, previous_status, notes, created_by)
     VALUES ($1, $2, $3, $4, $5)`,
    [orderId, newStatus, previousStatus, notes, createdBy]
  );

  return result.rows[0];
};

module.exports = {
  generateOrderNumber,
  createOrder,
  addOrderItems,
  getOrderById,
  getOrderByOrderNumber,
  getUserOrders,
  updateOrderStatus,
};
