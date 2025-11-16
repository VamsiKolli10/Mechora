import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  ArrowForward,
} from "@mui/icons-material";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "@/features/cart/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, items, subtotal, itemCount, loading, error } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CartIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start shopping to add items to your cart
        </Typography>
        <Button variant="contained" component={Link} to="/shop">
          Browse Watches
        </Button>
      </Box>
    );
  }

  // Calculate totals (tax and shipping would come from backend in real app)
  const tax = subtotal * 0.08; // 8% tax example
  const shipping = subtotal > 5000 ? 0 : 50; // Free shipping over $5000
  const total = subtotal + tax + shipping;

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {items.map((item) => (
              <Paper key={item.id} sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      image={item.assets?.[0]?.url || "/images/hero1.png"}
                      alt={item.model}
                      sx={{ borderRadius: 1, height: 150, objectFit: "cover" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography variant="h6" component={Link} to={`/shop/${item.slug}`}>
                        {item.brand_name || item.brand} {item.model}
                      </Typography>
                      {item.reference && (
                        <Typography variant="body2" color="text.secondary">
                          Ref: {item.reference}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary">
                        {formatPrice(item.price_at_added)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Stack spacing={2} alignItems="flex-end">
                      <TextField
                        type="number"
                        label="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                        }
                        inputProps={{ min: 1, max: item.stock_quantity }}
                        size="small"
                        sx={{ width: 100 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Typography variant="h6">
                        {formatPrice(item.price_at_added * item.quantity)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: "sticky", top: 100 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Subtotal</TableCell>
                  <TableCell align="right">{formatPrice(subtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tax</TableCell>
                  <TableCell align="right">{formatPrice(tax)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shipping</TableCell>
                  <TableCell align="right">
                    {shipping === 0 ? (
                      <Typography variant="body2" color="success.main">
                        FREE
                      </Typography>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatPrice(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleCheckout}
              sx={{ mt: 3 }}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/shop"
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart;
