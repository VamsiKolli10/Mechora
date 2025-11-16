import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Box, Typography, Grid, Paper, Card, CardMedia, CardContent, CircularProgress } from "@mui/material";
import { fetchFeaturedWatches } from "@/features/watches/watchesSlice";

const FeaturedWatches = () => {
  const dispatch = useDispatch();
  const { featuredWatches, loading } = useSelector((state) => state.watches);

  useEffect(() => {
    dispatch(fetchFeaturedWatches(6));
  }, [dispatch]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!featuredWatches || featuredWatches.length === 0) {
    return null;
  }

  return (
    <Box className="featured-watches">
      <Typography variant="h5" className="section-title" sx={{ mb: 3 }}>
        Featured Watches
      </Typography>
      <Grid container spacing={3}>
        {featuredWatches.map((watch) => (
          <Grid item xs={12} sm={6} md={4} key={watch.id}>
            <Card
              component={Link}
              to={`/shop/${watch.slug}`}
              sx={{
                textDecoration: "none",
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={watch.assets?.[0]?.url || "/images/hero1.png"}
                alt={watch.model}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {watch.brand_name || watch.brand}
                </Typography>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  {watch.model}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 1 }}>
                  {formatPrice(watch.sale_price)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedWatches;
