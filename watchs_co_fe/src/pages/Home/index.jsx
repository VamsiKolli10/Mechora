import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, CardMedia, Chip, Skeleton, Stack, Typography } from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { productsApi } from "@/services/productsApi";
import { buildWatchDetailPath } from "@/utils/watchRoutes";

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
const process = [
  ["01", "Find your watch", "Explore the catalogue and compare the reference, condition, and specifications."],
  ["02", "Send a request", "Add your selection to the bag and share your details. No payment is taken."],
  ["03", "Review the details", "Availability, final price, delivery, and return terms must be agreed before purchase."],
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    productsApi.getProducts({ limit: 4, sort_by: "created_at", sort_order: "DESC" })
      .then(({ data }) => { if (active) setProducts(data.products || data.watches || []); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  return (
    <Stack spacing={{ xs: 7, md: 11 }} sx={{ py: { xs: 2, md: 5 } }}>
      <Box component="section" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" }, gap: { xs: 4, md: 7 }, alignItems: "center" }}>
        <Box>
          <Typography variant="overline" color="secondary.main" sx={{ letterSpacing: ".2em" }}>The Mechora collection</Typography>
          <Typography component="h1" variant="h1" sx={{ fontSize: { xs: "3rem", sm: "4rem", lg: "5.5rem" }, lineHeight: 1.04, my: 2.5 }}>
            A watch to make<br />your own.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 460, fontSize: "1.1rem", lineHeight: 1.8 }}>
            Discover mechanical watches with character. Take your time, compare the details,
            and request the piece that feels right.
          </Typography>
          <Button component={RouterLink} to="/shop" size="large" variant="contained" endIcon={<ArrowForwardRounded />} sx={{ mt: 4 }}>
            Explore the watches
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Browse freely. Request without payment.</Typography>
        </Box>
        <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 3, bgcolor: "background.accent" }}>
          <Box component="img" src="/images/hero1.png" alt="A mechanical watch, shown as editorial inspiration"
            sx={{ width: "100%", aspectRatio: "4 / 5", maxHeight: 620, objectFit: "cover", display: "block" }} />
          <Chip label="Mechanical by nature" sx={{ position: "absolute", left: 20, bottom: 20, bgcolor: "background.paper" }} />
        </Box>
      </Box>

      <Box component="section" id="collections">
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="overline" color="secondary.main">Discover</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.3rem", md: "3.2rem" } }}>From the catalogue</Typography>
          </Box>
          <Button component={RouterLink} to="/shop" endIcon={<ArrowForwardRounded />}>View all watches</Button>
        </Stack>
        {error ? <Alert severity="warning" action={<Button onClick={() => setAttempt(a => a + 1)}>Retry</Button>}>The catalogue could not be loaded.</Alert>
          : !loading && !products.length ? <Typography color="text.secondary">Our catalogue is being prepared. Please check back soon.</Typography>
          : <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2.5 }}>
            {loading ? [1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={350} />)
              : products.map(watch => {
                const image = watch.primary_image_url || watch.assets?.find(asset => asset.type === "image")?.url;
                return (
                  <Card key={watch.id} component={RouterLink} to={buildWatchDetailPath(watch)} sx={{ textDecoration: "none", height: "100%", boxShadow: "none", "&:hover": { borderColor: "secondary.main" } }}>
                    {image ? <CardMedia component="img" src={image} alt={watch.model} loading="lazy" sx={{ aspectRatio: "1", objectFit: "contain", p: 2, bgcolor: "background.accent" }} />
                      : <Box sx={{ aspectRatio: "1", display: "grid", placeItems: "center", bgcolor: "background.accent" }}><Typography color="text.secondary">Image coming soon</Typography></Box>}
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">{watch.brand_name || watch.brand}</Typography>
                      <Typography variant="h6" sx={{ fontFamily: "Georgia, serif", mb: 1 }}>{watch.model}</Typography>
                      <Typography>{money(watch.sale_price)}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
          </Box>}
      </Box>

      <Box component="section" id="how-it-works" sx={{ borderTop: 1, borderBottom: 1, borderColor: "divider", py: { xs: 4, md: 6 } }}>
        <Typography variant="overline" color="secondary.main">A considered purchase</Typography>
        <Typography variant="h2" sx={{ mb: 4, fontSize: { xs: "2.3rem", md: "3.2rem" } }}>How it works</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 4 }}>
          {process.map(([number, title, detail]) => <Box key={number}>
            <Typography color="secondary.main" variant="overline">{number}</Typography>
            <Typography variant="h5" sx={{ my: 1 }}>{title}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>{detail}</Typography>
          </Box>)}
        </Box>
        <Alert severity="info" sx={{ mt: 4 }}>Mechora currently accepts order requests. A request is not a purchase or a stock reservation.</Alert>
      </Box>
    </Stack>
  );
}
