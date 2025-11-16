import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  IconButton,
  Badge,
  Drawer,
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Paper,
  CardMedia,
} from "@mui/material";
import {
  ShoppingCart as CartIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ArrowForward,
} from "@mui/icons-material";
import { removeFromCart, fetchCart } from "@/features/cart/cartSlice";

const MiniCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, itemCount, subtotal } = useSelector((state) => state.cart);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    dispatch(fetchCart());
  };

  const handleClose = () => setOpen(false);

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <IconButton onClick={handleOpen} color="inherit">
        <Badge badgeContent={itemCount} color="secondary">
          <CartIcon />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 400, p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Shopping Cart ({itemCount})
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {items.length === 0 ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Stack spacing={2} alignItems="center">
                <CartIcon sx={{ fontSize: 64, color: "text.secondary" }} />
                <Typography variant="h6" color="text.secondary">
                  Your cart is empty
                </Typography>
                <Button variant="outlined" onClick={handleClose} component={Link} to="/shop">
                  Browse Watches
                </Button>
              </Stack>
            </Box>
          ) : (
            <>
              <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
                <Stack spacing={2}>
                  {items.map((item) => (
                    <Paper key={item.id} sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <CardMedia
                          component="img"
                          image={item.assets?.[0]?.url || "/images/hero1.png"}
                          alt={item.model}
                          sx={{ width: 80, height: 80, borderRadius: 1, objectFit: "cover" }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.brand_name || item.brand} {item.model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                            {formatPrice(item.price_at_added * item.quantity)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(item.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Subtotal</Typography>
                  <Typography variant="h6">{formatPrice(subtotal)}</Typography>
                </Stack>
                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForward />}
                  onClick={() => {
                    handleClose();
                    navigate("/cart");
                  }}
                >
                  View Cart
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    handleClose();
                    navigate("/checkout");
                  }}
                >
                  Checkout
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default MiniCart;
