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
  CardMedia,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Breadcrumbs,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  ArrowBack,
  Share,
  CheckCircle,
} from "@mui/icons-material";
import {
  fetchWatchBySlug,
  clearCurrentWatch,
} from "@/features/watches/watchesSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { addToWishlist, removeFromWishlist, checkWishlistStatus } from "@/features/wishlist/wishlistSlice";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentWatch, loading, error } = useSelector((state) => state.watches);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (slug) {
      dispatch(fetchWatchBySlug(slug));
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

  const handleAddToCart = () => {
    if (currentWatch) {
      dispatch(addToCart({ watch_id: currentWatch.id, quantity }));
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

  return (
    <Box sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          Home
        </Link>
        <Link to="/shop" style={{ textDecoration: "none", color: "inherit" }}>
          Watches
        </Link>
        <Typography color="text.primary">{currentWatch.model}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Images */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Paper
              sx={{
                aspectRatio: "1",
                overflow: "hidden",
                borderRadius: 2,
                position: "relative",
              }}
            >
              <CardMedia
                component="img"
                image={mainImage?.url || "/images/hero1.png"}
                alt={currentWatch.model}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Paper>
            {images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto" }}>
                {images.map((image, index) => (
                  <Paper
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 100,
                      height: 100,
                      cursor: "pointer",
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? "primary.main" : "divider",
                      borderRadius: 1,
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
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {currentWatch.brand_name || currentWatch.brand}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
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
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
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

            <Stack direction="row" spacing={2}>
              <Chip
                label={currentWatch.stock_status?.replace("_", " ") || "Available"}
                color={currentWatch.stock_status === "in_stock" ? "success" : "default"}
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
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={currentWatch.stock_status !== "in_stock"}
                  fullWidth
                >
                  Add to Cart
                </Button>
                <IconButton
                  onClick={handleWishlistToggle}
                  color={wishlistStatus[currentWatch.id] ? "error" : "default"}
                  size="large"
                >
                  {wishlistStatus[currentWatch.id] ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton size="large">
                  <Share />
                </IconButton>
              </Stack>

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Authenticated by Swiss watchmakers</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Insured shipping included</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">7-day return policy</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        {/* Details Tabs */}
        <Grid item xs={12}>
          <Paper>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Specifications" />
              <Tab label="Description" />
              {currentWatch.recommended && currentWatch.recommended.length > 0 && (
                <Tab label="Recommended" />
              )}
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Table>
                  <TableBody>
                    {currentWatch.brand && (
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
                      <Card component={Link} to={`/shop/${watch.slug}`} sx={{ textDecoration: "none" }}>
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
    </Box>
  );
};

export default ProductDetail;
