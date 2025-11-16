import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  ExpandMore,
} from "@mui/icons-material";
import { fetchWatches, setFilters, fetchBrands, fetchCollections } from "@/features/watches/watchesSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { addToWishlist, removeFromWishlist, checkWishlistStatus } from "@/features/wishlist/wishlistSlice";
import { useDebounce } from "@/hooks/useDebounce";

const ProductList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { watches, pagination, filters, brands, collections, loading, error } = useSelector(
    (state) => state.watches
  );
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [priceRange, setPriceRange] = useState([
    filters.min_price || 0,
    filters.max_price || 100000,
  ]);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Sync URL params with filters
  useEffect(() => {
    const params = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      brand_id: searchParams.get("brand_id") || "",
      collection_id: searchParams.get("collection_id") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      stock_status: searchParams.get("stock_status") || "",
      condition: searchParams.get("condition") || "",
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: searchParams.get("sort_order") || "DESC",
      search: searchParams.get("search") || "",
    };

    const newFilters = {};
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        if (key === "page" || key === "limit") {
          newFilters[key] = parseInt(params[key]);
        } else if (key === "min_price" || key === "max_price") {
          newFilters[key] = parseFloat(params[key]);
        } else {
          newFilters[key] = params[key];
        }
      }
    });

    dispatch(setFilters(newFilters));
  }, [searchParams, dispatch]);

  // Fetch watches when filters change
  useEffect(() => {
    const params = { ...filters };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    dispatch(fetchWatches(params));
  }, [filters, debouncedSearch, dispatch]);

  // Fetch brands and collections on mount
  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCollections());
  }, [dispatch]);

  // Check wishlist status for watches
  useEffect(() => {
    if (user && watches.length > 0) {
      watches.forEach((watch) => {
        if (wishlistStatus[watch.id] === undefined) {
          dispatch(checkWishlistStatus(watch.id));
        }
      });
    }
  }, [watches, user, dispatch, wishlistStatus]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    dispatch(setFilters(newFilters));
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceRangeCommit = () => {
    handleFilterChange("min_price", priceRange[0]);
    handleFilterChange("max_price", priceRange[1]);
  };

  const handlePageChange = (event, value) => {
    handleFilterChange("page", value);
  };

  const handleAddToCart = (watchId) => {
    dispatch(addToCart({ watch_id: watchId, quantity: 1 }));
  };

  const handleWishlistToggle = (watchId) => {
    if (!user) {
      // Redirect to login
      window.location.href = "/login";
      return;
    }

    if (wishlistStatus[watchId]) {
      dispatch(removeFromWishlist(watchId));
    } else {
      dispatch(addToWishlist(watchId));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Search and Filters Header */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search watches..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange("search", e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </Button>

            {showFilters && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Brand</InputLabel>
                    <Select
                      value={filters.brand_id || ""}
                      onChange={(e) => handleFilterChange("brand_id", e.target.value)}
                      label="Brand"
                    >
                      <MenuItem value="">All Brands</MenuItem>
                      {brands.map((brand) => (
                        <MenuItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Collection</InputLabel>
                    <Select
                      value={filters.collection_id || ""}
                      onChange={(e) => handleFilterChange("collection_id", e.target.value)}
                      label="Collection"
                    >
                      <MenuItem value="">All Collections</MenuItem>
                      {collections.map((collection) => (
                        <MenuItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Stock Status</InputLabel>
                    <Select
                      value={filters.stock_status || ""}
                      onChange={(e) => handleFilterChange("stock_status", e.target.value)}
                      label="Stock Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="in_stock">In Stock</MenuItem>
                      <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                      <MenuItem value="pre_order">Pre-Order</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={`${filters.sort_by}_${filters.sort_order}`}
                      onChange={(e) => {
                        const [sort_by, sort_order] = e.target.value.split("_");
                        handleFilterChange("sort_by", sort_by);
                        handleFilterChange("sort_order", sort_order);
                      }}
                      label="Sort By"
                    >
                      <MenuItem value="created_at_DESC">Newest First</MenuItem>
                      <MenuItem value="created_at_ASC">Oldest First</MenuItem>
                      <MenuItem value="sale_price_ASC">Price: Low to High</MenuItem>
                      <MenuItem value="sale_price_DESC">Price: High to Low</MenuItem>
                      <MenuItem value="model_ASC">Name: A to Z</MenuItem>
                      <MenuItem value="model_DESC">Name: Z to A</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>Price Range</Typography>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    onChangeCommitted={handlePriceRangeCommit}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatPrice(value)}
                    min={0}
                    max={100000}
                    step={1000}
                  />
                  <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="body2">{formatPrice(priceRange[0])}</Typography>
                    <Typography variant="body2">{formatPrice(priceRange[1])}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            )}
          </Stack>
        </Paper>

        {/* Results */}
        {error && (
          <Alert severity="error" onClose={() => {}}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h6">
              {pagination.total} {pagination.total === 1 ? "watch" : "watches"} found
            </Typography>

            <Grid container spacing={3}>
              {watches.map((watch) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={watch.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Link
                      to={`/shop/${watch.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={watch.assets?.[0]?.url || "/images/hero1.png"}
                        alt={watch.model}
                        sx={{ objectFit: "cover" }}
                      />
                    </Link>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={1}>
                        <Typography variant="overline" color="text.secondary">
                          {watch.brand_name || watch.brand}
                        </Typography>
                        <Link
                          to={`/shop/${watch.slug}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {watch.model}
                          </Typography>
                        </Link>
                        {watch.reference && (
                          <Typography variant="body2" color="text.secondary">
                            Ref: {watch.reference}
                          </Typography>
                        )}
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          {formatPrice(watch.sale_price)}
                        </Typography>
                        {watch.stock_status && (
                          <Chip
                            label={watch.stock_status.replace("_", " ")}
                            size="small"
                            color={
                              watch.stock_status === "in_stock"
                                ? "success"
                                : watch.stock_status === "pre_order"
                                ? "warning"
                                : "default"
                            }
                          />
                        )}
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <IconButton
                        onClick={() => handleWishlistToggle(watch.id)}
                        color={wishlistStatus[watch.id] ? "error" : "default"}
                      >
                        {wishlistStatus[watch.id] ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                      <Button
                        size="small"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(watch.id)}
                        disabled={watch.stock_status !== "in_stock"}
                        fullWidth
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};

export default ProductList;
