import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Pagination,
} from "@mui/material";
import api from "@/utils/api";

const AccountOrders = () => {
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      fetchOrders();
    }
  }, [orderId, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/orders", { params: { page, limit: 10 } });
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/orders/${orderId}`);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      confirmed: "info",
      processing: "info",
      shipped: "primary",
      delivered: "success",
      cancelled: "error",
      refunded: "default",
    };
    return colors[status] || "default";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orderId && order) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Order Details
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Order #{order.order_number}</Typography>
              <Chip label={order.status} color={getStatusColor(order.status)} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </Typography>

            <Box>
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.brand} {item.model}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align="right">{formatPrice(item.unit_price)}</TableCell>
                      <TableCell align="right">{formatPrice(item.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Stack spacing={1} alignItems="flex-end">
              <Stack direction="row" spacing={2}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatPrice(order.subtotal)}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography>Tax:</Typography>
                <Typography>{formatPrice(order.tax_amount)}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography>Shipping:</Typography>
                <Typography>{formatPrice(order.shipping_amount)}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{formatPrice(order.total_amount)}</Typography>
              </Stack>
            </Stack>

            <Button component={Link} to="/account/orders" variant="outlined">
              Back to Orders
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Order History
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start shopping to see your orders here
          </Typography>
          <Button component={Link} to="/shop" variant="contained">
            Browse Watches
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.item_count || 0} items</TableCell>
                    <TableCell>{formatPrice(order.total_amount)}</TableCell>
                    <TableCell>
                      <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/account/orders/${order.id}`}
                        size="small"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AccountOrders;
