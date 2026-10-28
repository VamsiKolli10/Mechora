import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleRounded,
  LockRounded,
  LocalShippingRounded,
} from "@mui/icons-material";
import { clearCartState, fetchCart } from "@/features/cart/cartSlice";
import { ordersApi } from "@/services/ordersApi";
import { getErrorMessage } from "@/utils/errors";

const steps = ["Review", "Your details", "Submit request", "Received"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(price) || 0);


const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, items, subtotal, loading: cartLoading } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [order, setOrder] = useState(null);
  const [requestKey] = useState(() => crypto.randomUUID());
  const [guestEmail, setGuestEmail] = useState("");
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

  const totals = useMemo(() => {
    const numericSubtotal = items.reduce((sum, item) => sum + Math.round(Number(item.current_price ?? item.price_at_added) * 100) * item.quantity, 0) / 100;
    const tax = 0;
    const shipping = 0;
    return {
      subtotal: numericSubtotal,
      tax,
      shipping,
      total: numericSubtotal + tax + shipping,
    };
  }, [items]);

  useEffect(() => {
    if (!cart && !order) {
      dispatch(fetchCart());
    }
  }, [cart, dispatch, order]);

  useEffect(() => {
    if (user && !shippingAddress.name) {
      setShippingAddress((previous) => ({
        ...previous,
        name: user.name || previous.name,
      }));
    }
  }, [shippingAddress.name, user]);

  const updateShipping = (field) => (event) => {
    setShippingAddress((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
    setFormErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const updateBilling = (field) => (event) => {
    setBillingAddress((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
    setFormErrors((previous) => ({
      ...previous,
      [`billing_${field}`]: undefined,
    }));
  };

  const validateAddress = (address, prefix = "") => {
    const nextErrors = {};
    ["name", "street", "city", "state", "zip"].forEach((field) => {
      if (!String(address[field] || "").trim()) {
        nextErrors[`${prefix}${field}`] = "Required";
      }
    });
    return nextErrors;
  };

  const validateDelivery = () => {
    const nextErrors = validateAddress(shippingAddress);
    if (!user && !emailPattern.test(guestEmail.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!billingAddress.sameAsShipping) {
      Object.assign(nextErrors, validateAddress(billingAddress, "billing_"));
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    setError(null);
    if (activeStep === 1 && !validateDelivery()) return;
    setActiveStep((previous) => Math.min(previous + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((previous) => Math.max(previous - 1, 0));
  };

  const handleSubmitRequest = async () => {
    if (!validateDelivery()) {
      setActiveStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let activeOrder = order;
      if (!activeOrder) {
        const { data: createdOrder } = await ordersApi.createOrder({
          shipping_address: { ...shippingAddress, phone: shippingAddress.phone || undefined },
          billing_address: billingAddress.sameAsShipping
            ? { ...shippingAddress, phone: shippingAddress.phone || undefined }
            : {
                name: billingAddress.name,
                street: billingAddress.street,
                street2: billingAddress.street2,
                city: billingAddress.city,
                state: billingAddress.state,
                zip: billingAddress.zip,
                country: billingAddress.country,
              },
          guest_email: !user ? guestEmail.trim() : undefined,
        }, requestKey);
        activeOrder = createdOrder;
        setOrder(createdOrder);
      }

      handleRequestSuccess();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Your request could not be submitted. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    dispatch(clearCartState());
    setActiveStep(steps.length - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderOrderSummary = (compact = false) => (
    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, position: compact ? "static" : "sticky", top: 150, boxShadow: "none", borderColor: "secondary.main" }}>
      <Typography variant="overline" color="secondary.main">Your order</Typography>
      <Typography variant="h4" sx={{ fontFamily: "Georgia, serif" }} gutterBottom>
        Order summary
      </Typography>
      <Stack spacing={2} sx={{ my: 2.5 }}>
        {items.map((item) => (
          <Stack key={item.id} direction="row" spacing={2} alignItems="center">
            <Box
              component="img"
              src={item.primary_image_url || "/images/hero1.png"}
              alt={item.primary_image_alt || item.model}
              sx={{
                width: 64,
                height: 64,
                objectFit: "contain",
                borderRadius: 2,
                bgcolor: "background.accent",
                p: 0.5,
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {item.brand_name || item.brand} {item.model}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Qty {item.quantity}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {formatPrice((item.current_price ?? item.price_at_added) * item.quantity)}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Divider />
      <Stack spacing={1.25} sx={{ py: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography>{formatPrice(totals.subtotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">Tax</Typography>
          <Typography>To be quoted</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">Delivery</Typography>
          <Typography color={totals.shipping === 0 ? "success.main" : "inherit"}>
            To be quoted
          </Typography>
        </Stack>
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between" sx={{ pt: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Watch subtotal
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {formatPrice(order?.total_amount ?? totals.total)}
        </Typography>
      </Stack>
    </Paper>
  );

  const renderDelivery = () => (
    <Paper sx={{ p: { xs: 2.5, md: 4 }, boxShadow: "none" }}>
      <Typography variant="overline" color="secondary.main">Your details</Typography>
      <Typography variant="h4" sx={{ fontFamily: "Georgia, serif" }}>
        Delivery details
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        We’ll use these details to review delivery options for your request.
      </Typography>
      <Grid container spacing={2}>
        {!user && (
          <Grid item xs={12}>
            <TextField
              label="Email address"
              type="email"
              value={guestEmail}
              onChange={(event) => {
                setGuestEmail(event.target.value);
                setFormErrors((previous) => ({ ...previous, email: undefined }));
              }}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email || "Your receipt and tracking will be sent here"}
              required
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            label="Full name"
            value={shippingAddress.name}
            onChange={updateShipping("name")}
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Street address"
            value={shippingAddress.street}
            onChange={updateShipping("street")}
            error={Boolean(formErrors.street)}
            helperText={formErrors.street}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Apartment, suite, etc. (optional)"
            value={shippingAddress.street2}
            onChange={updateShipping("street2")}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            value={shippingAddress.city}
            onChange={updateShipping("city")}
            error={Boolean(formErrors.city)}
            helperText={formErrors.city}
            required
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="State / Province"
            value={shippingAddress.state}
            onChange={updateShipping("state")}
            error={Boolean(formErrors.state)}
            helperText={formErrors.state}
            required
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="Postal code"
            value={shippingAddress.zip}
            onChange={updateShipping("zip")}
            error={Boolean(formErrors.zip)}
            helperText={formErrors.zip}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={shippingAddress.country}
              onChange={updateShipping("country")}
              label="Country"
            >
              <MenuItem value="US">United States</MenuItem>
              <MenuItem value="CA">Canada</MenuItem>
              <MenuItem value="GB">United Kingdom</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone number (optional)"
            value={shippingAddress.phone}
            onChange={updateShipping("phone")}
          />
        </Grid>
      </Grid>

      <FormControlLabel
        sx={{ mt: 3 }}
        control={
          <Checkbox
            checked={billingAddress.sameAsShipping}
            onChange={(event) =>
              setBillingAddress((previous) => ({
                ...previous,
                sameAsShipping: event.target.checked,
              }))
            }
          />
        }
        label="Billing address is the same as delivery"
      />

      {!billingAddress.sameAsShipping && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Billing address
          </Typography>
          <Grid container spacing={2}>
            {[
              ["name", "Full name", 12],
              ["street", "Street address", 12],
              ["city", "City", 6],
              ["state", "State / Province", 3],
              ["zip", "Postal code", 3],
            ].map(([field, label, columns]) => (
              <Grid item xs={12} sm={columns} key={field}>
                <TextField
                  label={label}
                  value={billingAddress[field]}
                  onChange={updateBilling(field)}
                  error={Boolean(formErrors[`billing_${field}`])}
                  helperText={formErrors[`billing_${field}`]}
                  required
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Paper sx={{ p: { xs: 2.5, md: 4 }, boxShadow: "none" }}>
          <Typography variant="overline" color="secondary.main">Step one</Typography>
          <Typography variant="h4" sx={{ fontFamily: "Georgia, serif" }}>
            Review your order
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
            Confirm quantities and pricing before entering delivery details.
          </Typography>
          <Stack spacing={2}>
            {items.map((item) => (
              <Stack
                key={item.id}
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 3, bgcolor: "background.accent" }}
              >
                <Box
                  component="img"
                  src={item.primary_image_url || "/images/hero1.png"}
                  alt={item.primary_image_alt || item.model}
                  sx={{ width: 88, height: 88, objectFit: "contain", borderRadius: 2, bgcolor: "background.paper", p: 0.5 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>
                    {item.brand_name || item.brand} {item.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity {item.quantity}
                  </Typography>
                </Box>
                <Typography fontWeight={700}>
                  {formatPrice((item.current_price ?? item.price_at_added) * item.quantity)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      );
    }

    if (activeStep === 1) return renderDelivery();

    if (activeStep === 2) {
      return (
        <Paper sx={{ p: { xs: 2.5, md: 4 }, boxShadow: "none" }}>
          <Typography variant="overline" color="secondary.main">Final step</Typography>
          <Typography variant="h4">Submit your request</Typography>
          <Alert severity="info" sx={{ my: 3 }}>
            This is a request, not a completed purchase. No payment will be taken.
            Availability, final pricing, delivery, and return terms need confirmation.
            Submitting a request does not reserve a watch.
          </Alert>
          <Button variant="contained" size="large" onClick={handleSubmitRequest} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit order request"}
          </Button>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: { xs: 3, md: 7 }, textAlign: "center", boxShadow: "none" }}>
        <Box sx={{ width: 84, height: 84, borderRadius: "50%", bgcolor: "background.accent", display: "grid", placeItems: "center", mx: "auto", mb: 2.5 }}>
          <CheckCircleRounded sx={{ fontSize: 46, color: "success.main" }} />
        </Box>
        <Typography variant="h3" gutterBottom>
          Request received
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          No payment has been taken and no stock has been reserved.
        </Typography>
        {order?.order_number && (
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            Order {order.order_number}
          </Typography>
        )}
        <Typography color="text.secondary" sx={{ maxWidth: 520, mx: "auto", mb: 4 }}>
          Save your reference number. Final availability, tax, delivery costs, and return terms
          must be confirmed before you decide to purchase.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          {user && (
            <Button variant="contained" onClick={() => navigate("/account/orders")}>
              View my orders
            </Button>
          )}
          <Button variant={user ? "outlined" : "contained"} component={Link} to="/shop">
            Continue shopping
          </Button>
        </Stack>
      </Paper>
    );
  };

  if (cartLoading && !cart && !order) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if ((!cart || items.length === 0) && !order) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Add a watch before starting checkout.
        </Typography>
        <Button variant="contained" component={Link} to="/shop">
          Browse watches
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.main">Order request</Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.6rem", md: "4rem" } }}>
          Request this selection
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 3 }}
          sx={{ mt: 1.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <LockRounded fontSize="small" color="success" />
            <Typography variant="body2" color="text.secondary">
              No payment taken
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocalShippingRounded fontSize="small" color="success" />
            <Typography variant="body2" color="text.secondary">
              Delivery quoted separately
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{ mb: 4, display: { xs: "none", sm: "flex" } }}
      >
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

      <Grid container spacing={4} alignItems="flex-start">
        <Grid item xs={12} lg={8}>
          {renderStepContent()}
          {activeStep < 2 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 3 }}
            >
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="text"
              >
                Back
              </Button>
              <Button variant="contained" size="large" onClick={handleNext}>
                {activeStep === 0 ? "Continue to your details" : "Review request"}
              </Button>
            </Stack>
          )}
          {activeStep === 2 && (
            <Button variant="text" onClick={handleBack} disabled={loading} sx={{ mt: 2 }}>
              Back to delivery
            </Button>
          )}
        </Grid>
        {activeStep < 3 && (
          <Grid item xs={12} lg={4}>
            {renderOrderSummary()}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Checkout;
