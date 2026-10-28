import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Add,
  Delete as DeleteIcon,
  LocalShippingRounded,
  Remove,
  ShieldRounded,
  ShoppingCart as CartIcon,
  ArrowForward,
} from "@mui/icons-material";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} from "@/features/cart/cartSlice";
import { buildWatchDetailPath } from "@/utils/watchRoutes";
import { getErrorMessage } from "@/utils/errors";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, items, subtotal, itemCount, loading, error, mergeError } = useSelector(
    (state) => state.cart
  );

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
    navigate("/checkout");
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
      <Paper sx={{ py: { xs: 7, md: 11 }, px: 3, textAlign: "center", boxShadow: "none" }}>
        <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "background.accent", display: "grid", placeItems: "center", mx: "auto", mb: 2.5 }}>
          <CartIcon sx={{ fontSize: 32, color: "secondary.main" }} />
        </Box>
        {mergeError && <Alert severity="warning" sx={{ mb: 3 }} action={<Button onClick={() => dispatch(mergeCart())}>Retry merge</Button>}>{mergeError}</Alert>}
        <Typography variant="h3" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start shopping to add items to your cart
        </Typography>
        <Button variant="contained" component={Link} to="/shop">
          Explore the collection
        </Button>
      </Paper>
    );
  }

  const total = items.reduce((sum, item) => sum + Math.round(Number(item.current_price ?? item.price_at_added) * 100) * item.quantity, 0) / 100;

  return (
    <Box sx={{ py: { xs: 1, md: 3 } }}>
      <Typography variant="overline" color="secondary.main">Your selection</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "end" }} gap={1} sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.6rem", md: "4rem" } }}>
          Shopping bag
        </Typography>
        <Typography color="text.secondary">{itemCount} {itemCount === 1 ? "piece" : "pieces"} in your bag</Typography>
      </Stack>

      {mergeError && <Alert severity="warning" sx={{ mb: 3 }} action={<Button onClick={() => dispatch(mergeCart())}>Retry merge</Button>}>{mergeError}</Alert>}
      {error && error !== mergeError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage({ error }, "Unable to load cart")}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2.5, mb: 2.5, boxShadow: "none", bgcolor: "background.accent" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <LocalShippingRounded color="success" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  Adding to your bag does not reserve stock. Tax and delivery will be quoted separately.
                </Typography>
              </Box>
            </Stack>
          </Paper>
          <Stack spacing={2}>
            {items.map((item) => (
              <Paper key={item.id} sx={{ p: { xs: 2, md: 2.5 }, boxShadow: "none" }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      image={item.primary_image_url || "/images/hero1.png"}
                      alt={item.primary_image_alt || item.model}
                      sx={{ borderRadius: 3, height: 170, objectFit: "contain", bgcolor: "background.accent", p: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography
                        variant="h5"
                        component={Link}
                        to={buildWatchDetailPath({
                          slug: item.slug,
                          id: item.watch_id,
                        })}
                        sx={{ color: "text.primary", textDecoration: "none", fontFamily: "Georgia, serif" }}
                      >
                        {item.brand_name || item.brand} {item.model}
                      </Typography>
                      {item.reference && (
                        <Typography variant="body2" color="text.secondary">
                          Ref: {item.reference}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary">
                        {formatPrice(item.current_price ?? item.price_at_added)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Stack spacing={2} alignItems="flex-end">
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{ border: 1, borderColor: "divider", borderRadius: 999 }}
                      >
                        <IconButton
                          size="small"
                          aria-label={`Decrease quantity of ${item.model}`}
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography
                          aria-live="polite"
                          sx={{ minWidth: 32, textAlign: "center", fontWeight: 700 }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          aria-label={`Increase quantity of ${item.model}`}
                          disabled={item.quantity >= Math.min(10, item.stock_quantity)}
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Button
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </Button>
                      <Typography variant="h6">
                        {formatPrice((item.current_price ?? item.price_at_added) * item.quantity)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2.5, md: 3.5 }, position: "sticky", top: 150, boxShadow: "none", borderColor: "secondary.main" }}>
            <Typography variant="overline" color="secondary.main">Checkout</Typography>
            <Typography variant="h4" sx={{ mb: 2, fontFamily: "Georgia, serif" }}>
              Order summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Subtotal</TableCell>
                  <TableCell align="right">{formatPrice(total)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tax</TableCell>
                  <TableCell align="right">{"To be quoted"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shipping</TableCell>
                  <TableCell align="right">
                    To be quoted
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Watch subtotal</TableCell>
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
              Continue to request
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
            <Button
              color="error"
              fullWidth
              onClick={() => dispatch(clearCart())}
              sx={{ mt: 1 }}
            >
              Clear cart
            </Button>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ShieldRounded color="success" fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Submit a request without payment. Availability and final costs need confirmation.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart;
