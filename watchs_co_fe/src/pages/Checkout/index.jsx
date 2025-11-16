import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  fetchCart,
  clearCartState,
} from "@/features/cart/cartSlice";
import api from "@/utils/api";

const steps = ["Cart Review", "Shipping", "Payment", "Confirmation"];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, items, subtotal } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    name: "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!cart) {
      dispatch(fetchCart());
    }
  }, [cart, dispatch]);

  useEffect(() => {
    if (!user && activeStep > 0) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, activeStep, navigate]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        shipping_address: shippingAddress,
        billing_address: billingAddress.sameAsShipping
          ? shippingAddress
          : billingAddress,
        tax_amount: subtotal * 0.08,
        shipping_amount: subtotal > 5000 ? 0 : 50,
        guest_email: !user ? shippingAddress.email : undefined,
      };

      const { data } = await api.post("/api/orders", orderData);
      setOrder(data);
      dispatch(clearCartState());
      setActiveStep(steps.length - 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to place order");
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Order
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {items.map((item) => (
                <Paper key={item.id} sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Typography variant="body1" fontWeight={600}>
                        {item.brand_name || item.brand} {item.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                      <Typography variant="body1" fontWeight={600}>
                        {formatPrice(item.price_at_added * item.quantity)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Divider />
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Subtotal</Typography>
                  <Typography>{formatPrice(subtotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Tax</Typography>
                  <Typography>{formatPrice(subtotal * 0.08)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Shipping</Typography>
                  <Typography>
                    {subtotal > 5000 ? "FREE" : formatPrice(50)}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatPrice(subtotal + subtotal * 0.08 + (subtotal > 5000 ? 0 : 50))}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Apartment, suite, etc. (optional)"
                  value={shippingAddress.street2}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street2: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={shippingAddress.state}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, state: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={shippingAddress.zip}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, zip: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    label="Country"
                  >
                    <MenuItem value="US">United States</MenuItem>
                    <MenuItem value="CA">Canada</MenuItem>
                    <MenuItem value="UK">United Kingdom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <FormControlLabel
                control={
                  <Radio
                    checked={billingAddress.sameAsShipping}
                    onChange={(e) =>
                      setBillingAddress({
                        ...billingAddress,
                        sameAsShipping: e.target.checked,
                      })
                    }
                  />
                }
                label="Billing address same as shipping"
              />
            </Box>

            {!billingAddress.sameAsShipping && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Billing Address
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={billingAddress.name}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, name: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={billingAddress.street}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, street: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={billingAddress.city}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, city: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="State"
                      value={billingAddress.state}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, state: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={billingAddress.zip}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, zip: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Select Payment Method</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
                <FormControlLabel value="bank" control={<Radio />} label="Bank Transfer" />
              </RadioGroup>
            </FormControl>
            <Alert severity="info" sx={{ mt: 3 }}>
              Payment processing will be integrated with Stripe/PayPal in production.
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: "center", py: 4 }}>
            {order ? (
              <>
                <Typography variant="h4" gutterBottom color="success.main">
                  Order Confirmed!
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Order Number: {order.order_number}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Thank you for your order. You will receive a confirmation email shortly.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button variant="contained" onClick={() => navigate("/account/orders")}>
                    View Orders
                  </Button>
                  <Button variant="outlined" onClick={() => navigate("/shop")}>
                    Continue Shopping
                  </Button>
                </Stack>
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (!cart || items.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={() => navigate("/shop")} sx={{ mt: 2 }}>
          Browse Watches
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        {renderStepContent()}

        {activeStep < steps.length - 1 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {activeStep === steps.length - 2 ? "Place Order" : "Next"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Checkout;
