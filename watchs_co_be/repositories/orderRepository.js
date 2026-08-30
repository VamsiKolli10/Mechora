const Order = require("../models/orderModel");

module.exports = {
  createOrder: Order.createOrder,
  addOrderItems: Order.addOrderItems,
  getOrderById: Order.getOrderById,
  getOrderByOrderNumber: Order.getOrderByOrderNumber,
  getUserOrders: Order.getUserOrders,
  updateOrderStatus: Order.updateOrderStatus,
};
