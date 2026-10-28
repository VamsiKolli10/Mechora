import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Breadcrumbs,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  ArrowBack,
  Share,
  CheckCircle,
  Remove,
} from "@mui/icons-material";
import {
  fetchWatchBySlug,
  fetchWatchById,
  clearCurrentWatch,
} from "@/features/watches/watchesSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { addToWishlist, removeFromWishlist, checkWishlistStatus } from "@/features/wishlist/wishlistSlice";
import { buildWatchDetailPath, parseWatchSlugParam } from "@/utils/watchRoutes";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentWatch, detailLoading: loading, detailError: error } = useSelector((state) => state.watches);
  const { wishlistStatus, pendingIds: wishlistPending } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setTabValue(0);
    setNotice(previous => ({ ...previous, open: false }));
    dispatch(clearCurrentWatch());
    if (!slug) return;

    const { type, value } = parseWatchSlugParam(slug);
    if (type === "slug") {
      dispatch(fetchWatchBySlug(value));
    } else if (type === "id") {
      dispatch(fetchWatchById(value));
    }

    return () => {
      dispatch(clearCurrentWatch());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (currentWatch && user) {
      dispatch(checkWishlistStatus(currentWatch.id));
    }
  }, [currentWatch, user, dispatch]);

  const handleAddToCart = async ({ checkout = false } = {}) => {
    if (!currentWatch) return;
    setAdding(true);
    try {
      await dispatch(
        addToCart({ watch_id: currentWatch.id, quantity })
      ).unwrap();
      setNotice({
        open: true,
        severity: "success",
        message: `${quantity} ${quantity === 1 ? "watch" : "watches"} added to your cart`,
      });
      if (checkout) {
        navigate("/checkout");
      }
    } catch (cartError) {
      setNotice({
        open: true,
        severity: "error",
        message: cartError || "This watch could not be added to your cart",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (currentWatch) {
      if (wishlistStatus[currentWatch.id]) {
        dispatch(removeFromWishlist(currentWatch.id));
      } else {
        dispatch(addToWishlist(currentWatch.id));
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${currentWatch.brand_name || currentWatch.brand} ${currentWatch.model}`,
      text: `View this watch on Mechora`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setNotice({
          open: true,
          severity: "success",
          message: "Product link copied",
        });
      }
    } catch (shareError) {
      if (shareError?.name !== "AbortError") {
        setNotice({
          open: true,
          severity: "error",
          message: "The product link could not be shared",
        });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !currentWatch) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error || "Watch not found"}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/shop")} sx={{ mt: 2 }}>
          Back to Watches
        </Button>
      </Box>
    );
  }

  const images = currentWatch.assets?.filter((a) => a.type === "image") || [];
  const mainImage = images[selectedImage] || images[0];
  const availableQuantity = Math.max(Number(currentWatch.stock_quantity) || 0, 0);
  const inStock =
    ["in_stock", "low_stock"].includes(currentWatch.stock_status) && availableQuantity > 0;

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Breadcrumbs sx={{ mb: 3, color: "text.secondary", fontSize: 14 }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          Home
        </Link>
        <Link to="/shop" style={{ textDecoration: "none", color: "inherit" }}>
          Watches
        </Link>
        <Typography color="text.primary">{currentWatch.model}</Typography>
      </Breadcrumbs>

      <Grid container spacing={{ xs: 4, md: 7 }}>
        {/* Images */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                aspectRatio: "1",
                overflow: "hidden",
                borderRadius: 4,
                position: "relative",
                bgcolor: "background.accent",
                border: 1,
                borderColor: "divider",
              }}
            >
              <CardMedia
                component="img"
                image={mainImage?.url || "/images/hero1.png"}
                alt={currentWatch.model}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: { xs: 2, md: 4 },
                }}
              />
              <Chip
                label="Mechora selection"
                size="small"
                sx={{ position: "absolute", top: 16, left: 16, bgcolor: "background.paper" }}
              />
            </Paper>
            {images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto" }}>
                {images.map((image, index) => (
                  <Paper
                    elevation={0}
                    key={image.id || index}
                    component="button"
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 100,
                      height: 100,
                      cursor: "pointer",
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? "primary.main" : "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={image.url}
                      alt={`${currentWatch.model} ${index + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 4,
              border: 1,
              borderColor: "divider",
            }}
          >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="overline"
                color="secondary.main"
                sx={{ letterSpacing: "0.16em" }}
              >
                {currentWatch.brand_name || currentWatch.brand}
              </Typography>
              <Typography
                variant="h2"
                sx={{ mt: 1, fontSize: { xs: "2.25rem", md: "3.2rem" } }}
              >
                {currentWatch.model}
              </Typography>
              {currentWatch.reference && (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Reference: {currentWatch.reference}
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="h4"
                  sx={{ fontFamily: "Georgia, serif", fontWeight: 600 }}
                >
                  {formatPrice(currentWatch.sale_price)}
                </Typography>
                {currentWatch.msrp && currentWatch.msrp > currentWatch.sale_price && (
                  <Typography
                    variant="h6"
                    sx={{ textDecoration: "line-through", color: "text.secondary" }}
                  >
                    {formatPrice(currentWatch.msrp)}
                  </Typography>
                )}
              </Stack>
              {currentWatch.msrp && currentWatch.msrp > currentWatch.sale_price && (
                <Chip
                  label={`Save ${formatPrice(currentWatch.msrp - currentWatch.sale_price)}`}
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Chip
                label={currentWatch.stock_status?.replace("_", " ") || "Available"}
                color={inStock ? "success" : "default"}
              />
              {currentWatch.condition && (
                <Chip label={currentWatch.condition} variant="outlined" />
              )}
              {currentWatch.is_featured && (
                <Chip label="Featured" color="secondary" />
              )}
            </Stack>

            {currentWatch.short_description && (
              <Typography variant="body1">{currentWatch.short_description}</Typography>
            )}

            <Divider />

            {/* Actions */}
            <Stack spacing={2}>
              {inStock && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography fontWeight={700}>Quantity</Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ border: 1, borderColor: "divider", borderRadius: 999 }}
                  >
                    <IconButton
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((previous) => previous - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography
                      aria-live="polite"
                      sx={{ minWidth: 36, textAlign: "center", fontWeight: 700 }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      aria-label="Increase quantity"
                      disabled={quantity >= Math.min(availableQuantity, 10)}
                      onClick={() => setQuantity((previous) => previous + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {availableQuantity} available
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={() => handleAddToCart()}
                  disabled={!inStock || adding}
                  fullWidth
                >
                  {adding ? <CircularProgress size={22} color="inherit" /> : "Add to bag"}
                </Button>
                <IconButton
                  aria-label={wishlistStatus[currentWatch.id] ? "Remove from wishlist" : "Save to wishlist"}
                  disabled={Boolean(wishlistPending[currentWatch.id])}
                  onClick={handleWishlistToggle}
                  color={wishlistStatus[currentWatch.id] ? "error" : "default"}
                  size="large"
                >
                  {wishlistStatus[currentWatch.id] ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton
                  size="large"
                  aria-label="Share this watch"
                  onClick={handleShare}
                >
                  <Share />
                </IconButton>
              </Stack>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleAddToCart({ checkout: true })}
                disabled={!inStock || adding}
              >
                Request this watch
              </Button>

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Review condition and specifications below
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Delivery options quoted separately</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">No payment or stock reservation at this stage</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          </Paper>
        </Grid>

        {/* Details Tabs */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ borderRadius: 4, border: 1, borderColor: "divider", overflow: "hidden" }}
          >
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Specifications" />
              <Tab label="Description" />
              {currentWatch.recommended && currentWatch.recommended.length > 0 && (
                <Tab label="Recommended" />
              )}
            </Tabs>

            <Box sx={{ p: { xs: 2, md: 4 } }}>
              {tabValue === 0 && (
                <Table>
                  <TableBody>
                    {(currentWatch.brand || currentWatch.brand_name) && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
                        <TableCell>{currentWatch.brand_name || currentWatch.brand}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.model && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                        <TableCell>{currentWatch.model}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.reference && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                        <TableCell>{currentWatch.reference}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.movement && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Movement</TableCell>
                        <TableCell>{currentWatch.movement}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.case_material && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Case Material</TableCell>
                        <TableCell>{currentWatch.case_material}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.bracelet_material && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Bracelet Material</TableCell>
                        <TableCell>{currentWatch.bracelet_material}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.case_size && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Case Size</TableCell>
                        <TableCell>{currentWatch.case_size}mm</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.water_resistance && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Water Resistance</TableCell>
                        <TableCell>{currentWatch.water_resistance}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.power_reserve && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Power Reserve</TableCell>
                        <TableCell>{currentWatch.power_reserve}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.complication && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Complication</TableCell>
                        <TableCell>{currentWatch.complication}</TableCell>
                      </TableRow>
                    )}
                    {currentWatch.condition && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                        <TableCell>{currentWatch.condition}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {tabValue === 1 && (
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {currentWatch.description || "No description available."}
                </Typography>
              )}

              {tabValue === 2 && currentWatch.recommended && (
                <Grid container spacing={3}>
                  {currentWatch.recommended.map((watch) => (
                    <Grid item xs={12} sm={6} md={4} key={watch.id}>
                      <Card component={Link} to={buildWatchDetailPath(watch)} sx={{ textDecoration: "none" }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={watch.assets?.[0]?.url || "/images/hero1.png"}
                          alt={watch.model}
                        />
                        <CardContent>
                          <Typography variant="h6">{watch.model}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {watch.brand_name || watch.brand}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            {formatPrice(watch.sale_price)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotice((previous) => ({ ...previous, open: false }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice.severity}
          variant="filled"
          onClose={() =>
            setNotice((previous) => ({ ...previous, open: false }))
          }
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetail;
