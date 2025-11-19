import { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeaturedWatches } from "@/features/watches/watchesSlice";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import WatchLaterRoundedIcon from "@mui/icons-material/WatchLaterRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CandlestickChartRoundedIcon from "@mui/icons-material/CandlestickChartRounded";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SectionHeading from "@/components/common/SectionHeading";
import StatTile from "@/components/common/StatTile";
import FeatureCard from "@/components/common/FeatureCard";
import { Link as RouterLink } from "react-router-dom";
import { buildWatchDetailPath } from "@/utils/watchRoutes";

const highlightPieces = [
  {
    title: "Rolex Daytona 126500LN",
    details: "2024 steel · calibre 4131",
    price: "$34,200",
    tag: "Verified drop",
    image: "/images/hero3.png",
    specs: ["Box & papers", "Escrow ready", "Master-serviced"],
  },
  {
    title: "Audemars Piguet Royal Oak 15510ST",
    details: "41mm · blue grande tapisserie",
    price: "$59,900",
    tag: "Collector's desk",
    image: "/images/hero2.png",
    specs: ["2023", "Unworn", "Warranty through 2028"],
  },
  {
    title: "Patek Philippe 5164R Aquanaut",
    details: "Travel Time · rose gold",
    price: "$129,000",
    tag: "Concierge sourced",
    image: "/images/hero1.png",
    specs: ["Full set", "Dual time", "Geneva Seal"],
  },
];

const statHighlights = [
  {
    value: "$218M",
    label: "12 mo GMV",
    helper: "Transactions settled through Mechora",
    trend: "+18% vs LY",
  },
  {
    value: "2.4k",
    label: "References live",
    helper: "Curated weekly from maisons & independents",
    trend: "+94 this week",
  },
  {
    value: "72h",
    label: "Avg delivery",
    helper: "Bonded couriers, insured tracking",
  },
  {
    value: "4.9/5",
    label: "Collector rating",
    helper: "Concierge satisfaction across 6k reviews",
    trend: "6k reviews",
  },
];

const heroHighlights = [
  {
    icon: VerifiedRoundedIcon,
    title: "Swiss-authenticated",
    detail: "Master watchmakers certify provenance before listing.",
  },
  {
    icon: LocalShippingRoundedIcon,
    title: "Same-week delivery",
    detail: "Bonded couriers with GPS concierge in 50+ cities.",
  },
  {
    icon: WatchLaterRoundedIcon,
    title: "Aftercare studio",
    detail: "Factory-authorized servicing and strap atelier built in.",
  },
];

const liveSignals = [
  {
    title: "Royal Oak 15500ST",
    detail: "Geneva desk",
    metric: "+3.4%",
    status: "Liquidity high",
  },
  {
    title: "RM 67-02 Sprint",
    detail: "Dubai boutique",
    metric: "-1.1%",
    status: "Hold steady",
  },
  {
    title: "Daytona Le Mans",
    detail: "New York trade",
    metric: "+5.8%",
    status: "Active bids",
  },
];

const marketplacePrograms = [
  {
    icon: DiamondRoundedIcon,
    title: "Collectors Market",
    blurb: "Modern icons and independents, vetted daily by Mechora.",
  },
  {
    icon: CandlestickChartRoundedIcon,
    title: "Trade Desk",
    blurb: "Upgrade or consign with guaranteed buy-backs and live quotes.",
  },
  {
    icon: ShieldRoundedIcon,
    title: "Vault Storage",
    blurb: "Climate-secure storage with insured delivery anywhere in 72h.",
  },
];

const conciergePrograms = [
  {
    icon: AutoAwesomeRoundedIcon,
    title: "Private sourcing",
    detail:
      "Secure boutique-only releases and artist collaborations worldwide.",
  },
  {
    icon: BoltRoundedIcon,
    title: "Digital boutique",
    detail: "Macro tours with resident watchmakers for every listing.",
  },
  {
    icon: TimelineRoundedIcon,
    title: "Aftercare studio",
    detail: "Factory-authorized servicing, refinishing, and strap design.",
  },
];

const journalEntries = [
  {
    title: "Owning the new Daytona: checks before transfer",
    category: "Guides",
    readingTime: "6 min read",
  },
  {
    title: "Indie watchmakers redefining haute horlogerie",
    category: "Editorial",
    readingTime: "4 min read",
  },
  {
    title: "When to service a Royal Oak – advice from Le Brassus",
    category: "Service",
    readingTime: "5 min read",
  },
];

const heroBrands = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "FP Journe",
  "Vacheron Constantin",
  "Omega",
];

const testimonials = [
  {
    quote:
      "Mechora secured my Daytona allocation in under a week and handled every step with Rolex Geneva.",
    name: "Dan S.",
    role: "Collector · New York",
  },
  {
    quote:
      "The digital boutique let me inspect the Royal Oak macro finish before committing—super reassuring.",
    name: "Isabella V.",
    role: "Founder · Milan",
  },
  {
    quote:
      "Concierge shipping plus insured tracking made selling my Nautilus effortless.",
    name: "Noah R.",
    role: "Investor · Singapore",
  },
];

const collectorFaces = [
  { initials: "AV", label: "Avery – NYC" },
  { initials: "DS", label: "Dario – Milan" },
  { initials: "NR", label: "Noah – SG" },
  { initials: "HK", label: "Hana – Tokyo" },
];

const landingSectionIds = ["collections", "marketplace", "concierge"];

const Home = () => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();
  const { featuredWatches } = useSelector((state) => state.watches);

  useEffect(() => {
    dispatch(fetchFeaturedWatches(3));
  }, [dispatch]);

  // Handle hash scrolling on page load
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1); // Remove the #

      const scrollToElement = (retries = 0) => {
        const element = document.getElementById(hash);
        if (element && element.offsetParent !== null) {
          // Element exists and is visible
          const headerOffset = 100; // Account for sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: "smooth",
            });
          });
        } else if (retries < 10) {
          // Element not ready yet, retry after a short delay
          setTimeout(() => scrollToElement(retries + 1), 100);
        }
      };

      // On initial page load, wait for everything to render
      if (document.readyState === "complete") {
        // Page already loaded, wait for React to finish rendering
        setTimeout(() => scrollToElement(), 400);
      } else {
        // Wait for page to fully load, then wait for React rendering
        const handleLoad = () => {
          setTimeout(() => scrollToElement(), 400);
        };
        window.addEventListener("load", handleLoad, { once: true });
      }
    }
  }, [location.hash, location.pathname]);

  // Update the URL hash based on scroll position
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = landingSectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) {
      return;
    }

    const headerOffset = 120;
    let ticking = false;

    const updateHash = () => {
      ticking = false;

      let activeId = sections[0].id;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top - headerOffset <= 0) {
          activeId = section.id;
        } else {
          break;
        }
      }

      const desiredHash = `#${activeId}`;
      if (window.location.hash !== desiredHash) {
        const basePath = location.pathname || "/";
        const newUrl = `${basePath}${desiredHash}`;
        window.history.replaceState(window.history.state, "", newUrl);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHash);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateHash(); // set initial hash based on current position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  const heroBackground = useMemo(
    () =>
      theme.customComponents?.gradients?.hero ||
      (theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(15,23,42,.95), rgba(30,41,88,.8))"
        : "linear-gradient(135deg, #fefce8, #eef2ff)"),
    [theme]
  );

  const glassPanel = useMemo(
    () => ({
      backdropFilter: "blur(16px)",
      border: `1px solid ${alpha(
        theme.palette.common.white,
        theme.palette.mode === "dark" ? 0.05 : 0.12
      )}`,
      backgroundColor: alpha(
        theme.palette.mode === "dark"
          ? theme.palette.background.paper
          : "#ffffff",
        theme.palette.mode === "dark" ? 0.75 : 0.9
      ),
    }),
    [theme]
  );

  return (
    <Stack
      spacing={{ xs: 5, md: 8 }}
      id="collections"
      sx={{
        "& > *": {
          animation: "fadeIn 0.6s ease-in-out",
        },
        "@keyframes fadeIn": {
          from: {
            opacity: 0,
            transform: "translateY(20px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
          background: heroBackground,
        }}
      >
        {/* <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            background:
              "radial-gradient(circle at 20% 20%, rgba(147,197,253,0.45), transparent 55%), radial-gradient(circle at 80% 0, rgba(248,250,252,0.25), transparent 40%)",
          }}
        /> */}
        {/* <Box
          sx={{
            position: "absolute",
            top: { xs: 16, md: 24 },
            left: { xs: 24, md: 32 },
            right: { xs: 24, md: 32 },
            height: 8,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.secondary.main, 0.3),
          }}
        /> */}
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          position="relative"
        >
          <Grid item xs={12} md={7}>
            <Stack spacing={3} sx={{ mt: { xs: 4, md: 6 } }}>
              <Chip label="Certified watch marketplace" color="secondary" />
              <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 56 } }}>
                Shop grail watches with concierge-level trust
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Access retail allocations, rare independents, and insured
                servicing from one dashboard. Every piece is authenticated by
                Swiss-trained technicians.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  component={RouterLink}
                  to="/#marketplace"
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
                      "& .MuiSvgIcon-root": {
                        transform: "translateX(4px)",
                      },
                    },
                    "& .MuiSvgIcon-root": {
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    },
                  }}
                >
                  Browse marketplace
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      borderWidth: 2,
                    },
                  }}
                >
                  Book a live tour
                </Button>
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                alignItems="center"
              >
                <Stack direction="row" spacing={1}>
                  {collectorFaces.map((collector) => (
                    <Avatar
                      key={collector.initials}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: theme.palette.text.primary,
                      }}
                    >
                      {collector.initials}
                    </Avatar>
                  ))}
                </Stack>
                <Box>
                  <Typography fontWeight={600}>
                    6,200+ concierge collectors
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Escrow protected & insured by Lloyd's of London
                  </Typography>
                </Box>
              </Stack>
              <Grid container spacing={2} mt={{ xs: 2, md: 3 }}>
                {heroHighlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={item.title}>
                      <Stack
                        spacing={1.2}
                        direction="row"
                        alignItems="flex-start"
                        sx={{
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: alpha(theme.palette.secondary.main, 0.15),
                            color: theme.palette.secondary.main,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            flexShrink: 0,
                          }}
                        >
                          <Icon />
                        </Box>
                        <Box>
                          <Typography fontWeight={600}>{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.detail}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Box sx={{ p: 3, ...glassPanel, borderRadius: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Live trading desk
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      Market radar
                    </Typography>
                  </Box>
                  <Chip label="Realtime" color="secondary" size="small" />
                </Stack>
                <Stack spacing={2}>
                  {liveSignals.map((signal) => (
                    <Paper
                      key={signal.title}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(
                          theme.palette.text.primary,
                          0.08
                        )}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography fontWeight={600}>
                            {signal.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {signal.detail}
                          </Typography>
                        </Box>
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Typography fontWeight={600}>
                            {signal.metric}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {signal.status}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ p: 3, ...glassPanel, borderRadius: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Concierge availability
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      11 private allocations left
                    </Typography>
                    <Typography color="text.secondary">
                      Rolex, AP, Patek, Journe boutique programs
                    </Typography>
                  </Box>
                  <TrendingUpRoundedIcon color="secondary" />
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid
        container
        spacing={{ xs: 2, md: 2 }}
        sx={{ "& > .MuiGrid-item": { display: "flex" } }}
      >
        {statHighlights.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <StatTile
              value={stat.value}
              label={stat.label}
              helper={stat.helper}
              trend={stat.trend}
            />
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "center",
          p: { xs: 4, md: 6 },
          borderRadius: 2,
          border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Instant valuation
          </Typography>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Curious what your watch is worth?
          </Typography>
          <Typography color="text.secondary">
            Enter a reference number and our desk returns trade and consignment
            offers within one business day.
          </Typography>
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
            {["126500LN", "15510ST", "5164R"].map((ref) => (
              <Chip key={ref} label={ref} size="small" />
            ))}
          </Stack>
        </Box>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          width={{ xs: "100%", md: "auto" }}
          sx={{ flexShrink: 0 }}
        >
          <TextField
            placeholder="Ex. 126500LN"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
                "& .MuiSvgIcon-root": {
                  transform: "translateX(4px)",
                },
              },
              "& .MuiSvgIcon-root": {
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
          >
            Get valuation
          </Button>
        </Stack>
      </Paper>

      <Box id="marketplace">
        <SectionHeading
          eyebrow="Featured"
          title="Marketplace highlights"
          subtitle="Fresh drops every Monday from Geneva, Dubai, Hong Kong, and Tokyo partners."
          action={
            <Button
              component={RouterLink}
              to="/shop"
              endIcon={<ArrowForwardIcon />}
            >
              View all listings
            </Button>
          }
        />
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          sx={{ "& > .MuiGrid-item": { display: "flex" } }}
        >
          {featuredWatches && featuredWatches.length > 0
            ? featuredWatches.slice(0, 3).map((watch) => (
                <Grid item xs={12} sm={6} md={4} key={watch.id}>
                  <FeatureCard
                    image={watch.assets?.[0]?.url || "/images/hero1.png"}
                    tag={watch.is_featured ? "Featured" : null}
                    title={`${watch.brand_name || watch.brand} ${watch.model}`}
                    subtitle={watch.reference || watch.short_description}
                    price={new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(watch.sale_price)}
                    specs={[
                      watch.condition && `Condition: ${watch.condition}`,
                      watch.stock_status &&
                        `Stock: ${watch.stock_status.replace("_", " ")}`,
                    ].filter(Boolean)}
                    actionLabel="View Details"
                    onAction={() =>
                      (window.location.href = buildWatchDetailPath(watch))
                    }
                  />
                </Grid>
              ))
            : highlightPieces.map((piece) => (
                <Grid item xs={12} sm={6} md={4} key={piece.title}>
                  <FeatureCard
                    image={piece.image}
                    tag={piece.tag}
                    title={piece.title}
                    subtitle={piece.details}
                    price={piece.price}
                    specs={piece.specs}
                  />
                </Grid>
              ))}
        </Grid>
      </Box>

      <Grid container spacing={4} id="market-services">
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              height: "100%",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <SectionHeading
              title="Marketplace services"
              subtitle="Everything needed to buy, trade, or secure storage without leaving Mechora."
            />
            <Stack spacing={3} mt={2}>
              {marketplacePrograms.map((item) => {
                const Icon = item.icon;
                return (
                  <Stack direction="row" spacing={2} key={item.title}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.12),
                        color: theme.palette.secondary.main,
                      }}
                    >
                      <Icon />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.blurb}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
            <Button sx={{ mt: 4 }} endIcon={<ArrowForwardIcon />}>
              Learn about sourcing
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} id="concierge">
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              height: "100%",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <SectionHeading
              title="Concierge & aftercare"
              subtitle="Your single relationship for sourcing, servicing, and resale."
            />
            <Stack spacing={3}>
              {conciergePrograms.map((item) => {
                const Icon = item.icon;
                return (
                  <Stack direction="row" spacing={2} key={item.title}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.12),
                        color: theme.palette.info.main,
                      }}
                    >
                      <Icon />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.detail}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
            <Button sx={{ mt: 4 }} variant="outlined">
              Talk to concierge
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4} id="stories">
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              height: "100%",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <SectionHeading
              eyebrow="Journal"
              title="Learn from master watchmakers"
              subtitle="Editorial deep dives written with maison partners."
            />
            <Stack spacing={3}>
              {journalEntries.map((entry) => (
                <Box key={entry.title}>
                  <Typography
                    variant="body2"
                    color="secondary"
                    fontWeight={600}
                  >
                    {entry.category}
                  </Typography>
                  <Typography fontWeight={600}>{entry.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.readingTime}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Button sx={{ mt: 3 }} endIcon={<ArrowForwardIcon />}>
              Read the journal
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              height: "100%",
              borderRadius: 2,
            }}
          >
            <SectionHeading
              eyebrow="Trusted brands"
              title="Partner maisons"
              subtitle="54 maisons offering direct allocations."
            />
            <Grid container spacing={2}>
              {heroBrands.map((brand) => (
                <Grid item xs={6} key={brand}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 1.5,
                      p: 2,
                      textAlign: "center",
                      typography: "subtitle1",
                      fontWeight: 600,
                    }}
                  >
                    {brand}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        sx={{ "& > .MuiGrid-item": { display: "flex" } }}
      >
        {testimonials.map((entry) => (
          <Grid item xs={12} sm={6} md={4} key={entry.name}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                borderRadius: 2,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 12px 32px rgba(0,0,0,0.3)"
                      : "0 12px 32px rgba(0,0,0,0.08)",
                },
              }}
              role="article"
              aria-label={`Testimonial from ${entry.name}`}
            >
              <Typography variant="body1">"{entry.quote}"</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight={600}>{entry.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {entry.role}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          mt: 2,
          p: { xs: 4, md: 5 },
          borderRadius: 2,
          textAlign: "center",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(120deg, rgba(88,28,135,.7), rgba(37,99,235,.5))"
              : "linear-gradient(120deg, #ede9fe, #dbeafe)",
        }}
      >
        <Typography variant="overline" color="text.secondary">
          Ready to collect?
        </Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Join Mechora concierge
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Unlock private allocations, bespoke sourcing, and our global
          watchmaker network.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/registration"
            sx={{
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
              },
            }}
          >
            Create account
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/login"
            sx={{
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                borderWidth: 2,
              },
            }}
          >
            Sign in
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Home;
