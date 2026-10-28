import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Slider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ShoppingCart,
  VerifiedRounded,
} from "@mui/icons-material";
import {
  fetchBrands,
  fetchCollections,
  fetchWatches,
  replaceFilters,
} from "@/features/watches/watchesSlice";
import { addToCart } from "@/features/cart/cartSlice";
import {
  addToWishlist,
  checkWishlistStatus,
  removeFromWishlist,
} from "@/features/wishlist/wishlistSlice";
import { buildWatchDetailPath } from "@/utils/watchRoutes";

const MAX_PRICE = 250000;
const NUMERIC_FILTER_KEYS = new Set([
  "page",
  "limit",
  "brand_id",
  "collection_id",
  "min_price",
  "max_price",
]);

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    watches,
    pagination,
    filters,
    brands,
    collections,
    listLoading: loading,
    listError: error,
  } = useSelector((state) => state.watches);
  const { wishlistStatus, pendingIds: wishlistPending } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [showFilters, setShowFilters] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [notice, setNotice] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const nextFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (!value) continue;
      nextFilters[key] = NUMERIC_FILTER_KEYS.has(key) ? Number(value) : value;
    }
    dispatch(replaceFilters(nextFilters));
  }, [dispatch, searchParams]);

  useEffect(() => {
    setSearchQuery(filters.search || "");
    setPriceRange([
      filters.min_price ?? 0,
      filters.max_price ?? MAX_PRICE,
    ]);
  }, [filters.max_price, filters.min_price, filters.search]);

  useEffect(() => {
    const requestFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );
    dispatch(fetchWatches(requestFilters));
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCollections());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    watches.forEach((watch) => {
      if (wishlistStatus[watch.id] === undefined) {
        dispatch(checkWishlistStatus(watch.id));
      }
    });
  }, [dispatch, user, watches, wishlistStatus]);

  const applyFilters = useCallback(
    (updates, { resetPage = true } = {}) => {
      const nextParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, String(value));
        }
      });
      if (resetPage) nextParams.delete("page");
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    applyFilters({ search: searchQuery.trim() || null });
  };

  const handleBrandChange = (event) => {
    const brandId = Number(event.target.value) || null;
    const brand = brands.find((item) => item.id === brandId);
    applyFilters({
      brand_id: brandId,
      brand_name: brand?.name || null,
    });
  };

  const handleCollectionChange = (event) => {
    const collectionId = Number(event.target.value) || null;
    const collection = collections.find((item) => item.id === collectionId);
    applyFilters({
      collection_id: collectionId,
      collection_name: collection?.name || null,
    });
  };

  const handleSortChange = (event) => {
    const separator = event.target.value.lastIndexOf("_");
    applyFilters({
      sort_by: event.target.value.slice(0, separator),
      sort_order: event.target.value.slice(separator + 1),
    });
  };

  const handleAddToCart = async (watch) => {
    setAddingId(watch.id);
    try {
      await dispatch(
        addToCart({ watch_id: watch.id, quantity: 1 })
      ).unwrap();
      setNotice({
        open: true,
        severity: "success",
        message: `${watch.brand_name || watch.brand} ${watch.model} added to your cart`,
      });
    } catch (cartError) {
      setNotice({
        open: true,
        severity: "error",
        message: cartError || "This watch could not be added to your cart",
      });
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlistToggle = async (watchId) => {
    if (!user) {
      navigate(
        `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
      );
      return;
    }
    const action = wishlistStatus[watchId]
      ? removeFromWishlist(watchId)
      : addToWishlist(watchId);
    try {
      await dispatch(action).unwrap();
    } catch (wishlistError) {
      setNotice({
        open: true,
        severity: "error",
        message: wishlistError || "Wishlist could not be updated",
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange([0, MAX_PRICE]);
    setSearchParams({});
  };

  const activeFilters = useMemo(
    () =>
      [
        filters.search && {
          key: "search",
          label: `Search: ${filters.search}`,
          clear: { search: null },
        },
        (filters.brand_id || filters.brand_name) && {
          key: "brand",
          label: filters.brand_name || "Selected brand",
          clear: { brand_id: null, brand_name: null },
        },
        (filters.collection_id || filters.collection_name) && {
          key: "collection",
          label: filters.collection_name || "Selected collection",
          clear: { collection_id: null, collection_name: null },
        },
        filters.stock_status && {
          key: "stock",
          label: filters.stock_status.replaceAll("_", " "),
          clear: { stock_status: null },
        },
        (filters.min_price != null || filters.max_price != null) && {
          key: "price",
          label: `${formatPrice(filters.min_price || 0)}–${formatPrice(
            filters.max_price || MAX_PRICE
          )}`,
          clear: { min_price: null, max_price: null },
        },
      ].filter(Boolean),
    [filters]
  );

  return (
    <Box sx={{ py: { xs: 1, md: 3 } }}>
      <Stack spacing={{ xs: 2.5, md: 4 }}>
        <Box>
          <Breadcrumbs sx={{ mb: 2, fontSize: 13 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              Home
            </Link>
            <Typography color="text.primary">Shop</Typography>
          </Breadcrumbs>
          <Typography variant="overline" color="secondary.main">
            The collection
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2.6rem", md: "4.5rem" }, maxWidth: 760 }}>
            Find a watch worth keeping.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, fontSize: { md: 17 }, lineHeight: 1.7 }}>
            Curated references from established maisons and independent makers,
            with condition and specifications to help you compare.
          </Typography>
          <Stack direction="row" spacing={2.5} useFlexGap flexWrap="wrap" sx={{ mt: 2.5 }}>
            {["Detailed specifications", "No-payment requests", "Availability confirmed on follow-up"].map((item) => (
              <Stack key={item} direction="row" spacing={0.75} alignItems="center">
                <VerifiedRounded sx={{ fontSize: 17, color: "secondary.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 2.5 }, boxShadow: "none" }}>
          <Stack spacing={2}>
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                placeholder="Search by brand, model, or reference"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" size="small">
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.5}>
              <Button
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters((previous) => !previous)}
                variant="outlined"
                aria-expanded={showFilters}
              >
                {showFilters ? "Hide" : "Refine"} filters
              </Button>
              <Typography variant="body2" color="text.secondary">
                {pagination.total} curated {pagination.total === 1 ? "piece" : "pieces"}
              </Typography>
            </Stack>

            <Collapse in={showFilters}>
              <Box
                sx={{
                  pt: 1,
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={filters.brand_id ?? ""}
                    onChange={handleBrandChange}
                    label="Brand"
                  >
                    <MenuItem value="">All brands</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Collection</InputLabel>
                  <Select
                    value={filters.collection_id ?? ""}
                    onChange={handleCollectionChange}
                    label="Collection"
                  >
                    <MenuItem value="">All collections</MenuItem>
                    {collections.map((collection) => (
                      <MenuItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={filters.stock_status || ""}
                    onChange={(event) =>
                      applyFilters({ stock_status: event.target.value || null })
                    }
                    label="Availability"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="in_stock">In stock</MenuItem>
                    <MenuItem value="low_stock">Low stock</MenuItem>
                    <MenuItem value="out_of_stock">Out of stock</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={`${filters.sort_by}_${filters.sort_order}`}
                    onChange={handleSortChange}
                    label="Sort by"
                  >
                    <MenuItem value="created_at_DESC">Newest first</MenuItem>
                    <MenuItem value="sale_price_ASC">Price: low to high</MenuItem>
                    <MenuItem value="sale_price_DESC">Price: high to low</MenuItem>
                    <MenuItem value="model_ASC">Name: A to Z</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ gridColumn: "1 / -1", px: 1 }}>
                  <Typography gutterBottom>Price range</Typography>
                  <Slider
                    value={priceRange}
                    onChange={(_, value) => setPriceRange(value)}
                    onChangeCommitted={() =>
                      applyFilters({
                        min_price: priceRange[0] === 0 ? null : priceRange[0],
                        max_price:
                          priceRange[1] === MAX_PRICE ? null : priceRange[1],
                      })
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={formatPrice}
                    min={0}
                    max={MAX_PRICE}
                    step={2500}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {formatPrice(priceRange[0])}
                    </Typography>
                    <Typography variant="body2">
                      {formatPrice(priceRange[1])}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Collapse>

            {activeFilters.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {activeFilters.map((filter) => (
                  <Chip
                    key={filter.key}
                    label={filter.label}
                    onDelete={() => applyFilters(filter.clear)}
                    sx={{ textTransform: "capitalize" }}
                  />
                ))}
                <Button size="small" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>

        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => dispatch(fetchWatches(filters))}
              >
                Retry
              </Button>
            }
          >
            We couldn’t load the catalog. {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="h4" sx={{ fontFamily: "Georgia, serif" }}>
                Available now
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
              </Typography>
            </Stack>

            {watches.length === 0 ? (
              <Paper sx={{ py: 8, px: 3, textAlign: "center" }}>
                <SearchIcon sx={{ fontSize: 56, color: "text.secondary", mb: 2 }} />
                <Typography variant="h5" fontWeight={700}>
                  No watches match these filters
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                  Try a broader search or clear the filters to view the full catalog.
                </Typography>
                <Button variant="contained" onClick={clearAllFilters}>
                  View all watches
                </Button>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: {
                    xs: "repeat(auto-fill, minmax(240px, 1fr))",
                    md: "repeat(auto-fill, minmax(270px, 1fr))",
                  },
                }}
              >
                {watches.map((watch) => {
                  const inStock =
                    ["in_stock", "low_stock"].includes(watch.stock_status) &&
                    Number(watch.stock_quantity) > 0;
                  return (
                    <Card
                      key={watch.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        boxShadow: "none",
                        transition: "transform 240ms ease, box-shadow 240ms ease",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 22px 60px rgba(40,34,25,0.13)",
                          "& .watch-image": { transform: "scale(1.035)" },
                        },
                      }}
                    >
                      <Box
                        component={Link}
                        to={buildWatchDetailPath(watch)}
                        sx={{
                          display: "block",
                          position: "relative",
                          bgcolor: "background.accent",
                          overflow: "hidden",
                          p: { xs: 1.5, md: 2 },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={watch.assets?.[0]?.url || "/images/hero1.png"}
                          alt={watch.assets?.[0]?.alt_text || watch.model}
                          className="watch-image"
                          sx={{
                            height: { xs: 280, md: 320 },
                            objectFit: "contain",
                            borderRadius: 3,
                            transition: "transform 500ms cubic-bezier(.2,.8,.2,1)",
                          }}
                        />
                        {watch.is_featured && (
                          <Chip
                            label="Featured"
                            color="secondary"
                            size="small"
                            sx={{ position: "absolute", top: 16, left: 16 }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flex: 1, p: 2.5 }}>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ letterSpacing: "0.12em" }}
                        >
                          {watch.brand_name || watch.brand}
                        </Typography>
                        <Typography
                          variant="h5"
                          component={Link}
                          to={buildWatchDetailPath(watch)}
                          sx={{
                            color: "text.primary",
                            display: "block",
                            textDecoration: "none",
                            fontFamily: "Georgia, serif",
                            fontWeight: 500,
                            mt: 0.5,
                          }}
                        >
                          {watch.model}
                        </Typography>
                        {watch.reference && (
                          <Typography variant="body2" color="text.secondary">
                            Ref. {watch.reference}
                          </Typography>
                        )}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="h6" fontWeight={700} letterSpacing="-0.02em">
                            {formatPrice(watch.sale_price)}
                          </Typography>
                          <Chip
                            label={inStock ? "In stock" : "Unavailable"}
                            size="small"
                            color={inStock ? "success" : "default"}
                            variant={inStock ? "filled" : "outlined"}
                          />
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                        <IconButton
                          aria-label={
                            wishlistStatus[watch.id]
                              ? `Remove ${watch.model} from wishlist`
                              : `Add ${watch.model} to wishlist`
                          }
                          disabled={Boolean(wishlistPending[watch.id])}
                          onClick={() => handleWishlistToggle(watch.id)}
                          color={wishlistStatus[watch.id] ? "error" : "default"}
                        >
                          {wishlistStatus[watch.id] ? (
                            <Favorite />
                          ) : (
                            <FavoriteBorder />
                          )}
                        </IconButton>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={
                            addingId === watch.id ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <ShoppingCart />
                            )
                          }
                          disabled={!inStock || addingId === watch.id}
                          onClick={() => handleAddToCart(watch)}
                        >
                          {inStock ? "Add to cart" : "Out of stock"}
                        </Button>
                      </CardActions>
                    </Card>
                  );
                })}
              </Box>
            )}

            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(_, page) =>
                    applyFilters({ page }, { resetPage: false })
                  }
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Stack>

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

export default ProductList;
