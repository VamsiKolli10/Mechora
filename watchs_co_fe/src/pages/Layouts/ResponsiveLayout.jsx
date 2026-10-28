import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import MiniCart from "@/components/MiniCart";
import ThemeToggle from "@/components/ThemeToggle";
import useAuth from "@/hooks/useAuth";
import ScrollToLocation from "@/components/ScrollToLocation";

const DRAWER_WIDTH = 304;

const navigation = [
  { label: "Watches", to: "/shop" },
  { label: "New arrivals", to: "/shop?sort_by=created_at&sort_order=DESC" },
  { label: "In stock", to: "/shop?stock_status=in_stock" },
  { label: "How it works", to: "/#how-it-works" },
];

const BrandMark = () => (
  <Stack direction="row" alignItems="center" spacing={1.2}>
    <Box
      aria-hidden="true"
      sx={{
        width: 30,
        height: 30,
        border: "1px solid",
        borderColor: "secondary.main",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: "secondary.main",
        fontFamily: "Georgia, serif",
        fontSize: 13,
      }}
    >
      M
    </Box>
    <Typography
      variant="h5"
      sx={{ fontFamily: "Georgia, serif", fontWeight: 500, letterSpacing: "0.08em" }}
    >
      MECHORA
    </Typography>
  </Stack>
);

const isActiveRoute = (location, target) => {
  const targetUrl = new URL(target, window.location.origin);
  if (location.pathname !== targetUrl.pathname) return false;

  if (targetUrl.hash) return location.hash === targetUrl.hash;
  if (!targetUrl.search) return !location.search;

  const current = new URLSearchParams(location.search);
  return [...targetUrl.searchParams].every(
    ([key, value]) => current.get(key) === value
  );
};

const ResponsiveLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const drawer = (
    <Box
      component="nav"
      aria-label="Mobile navigation"
      sx={{ width: DRAWER_WIDTH, maxWidth: "86vw", minHeight: "100%" }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
        <BrandMark />
        <IconButton aria-label="Close navigation" onClick={() => setDrawerOpen(false)}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={isActiveRoute(location, item.to)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        ))}
        <ListItemButton
          component={RouterLink}
          to="/cart"
          selected={location.pathname === "/cart"}
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemText primary="Cart" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
        {isAuthenticated && (
          <ListItemButton
            component={RouterLink}
            to="/account"
            selected={location.pathname.startsWith("/account")}
            sx={{ borderRadius: 2 }}
          >
            <ListItemText primary="My account" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        )}
      </List>
      <Divider />
      <Stack spacing={1.25} sx={{ p: 2.5 }}>
        {isAuthenticated ? (
          <Button variant="outlined" onClick={handleLogout}>Log out</Button>
        ) : (
          <>
            <Button component={RouterLink} to="/login" variant="outlined">Log in</Button>
            <Button component={RouterLink} to="/registration" variant="contained">Create account</Button>
          </>
        )}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <ScrollToLocation />
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          top: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: alpha(theme.palette.background.paper, 0.88),
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: 0.8, px: 2 }}>
          <Typography variant="caption" component="p" textAlign="center" fontWeight={600} letterSpacing="0.055em">
            AUTHENTICATED BY EXPERTS · INSURED GLOBAL DELIVERY · 7-DAY RETURNS
          </Typography>
        </Box>
        <Toolbar disableGutters>
          <Container
            maxWidth="xl"
            sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 }, py: 1 }}
          >
            <IconButton
              aria-label="Open navigation"
              aria-controls="primary-navigation-drawer"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box
              component={RouterLink}
              to="/"
              aria-label="Mechora home"
              sx={{ color: "text.primary", textDecoration: "none" }}
            >
              <BrandMark />
            </Box>

            <Stack
              component="nav"
              aria-label="Primary navigation"
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1, justifyContent: "center" }}
            >
              {navigation.map((item) => (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  aria-current={isActiveRoute(location, item.to) ? "page" : undefined}
                  sx={{
                    px: 1.5,
                    fontSize: 13,
                    color: isActiveRoute(location, item.to) ? "text.primary" : "text.secondary",
                    bgcolor: isActiveRoute(location, item.to)
                      ? alpha(theme.palette.secondary.main, 0.12)
                      : "transparent",
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: "auto" }}>
              <MiniCart />
              <ThemeToggle />
              {isDesktop && (
                isAuthenticated ? (
                  <>
                    <Button component={RouterLink} to="/account" color="inherit">Account</Button>
                    <Button onClick={handleLogout} color="inherit">Log out</Button>
                  </>
                ) : (
                  <>
                    <Button component={RouterLink} to="/login" color="inherit">Log in</Button>
                    <Button component={RouterLink} to="/registration" variant="contained">Create account</Button>
                  </>
                )
              )}
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Drawer
        id="primary-navigation-drawer"
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { width: DRAWER_WIDTH, maxWidth: "86vw" } } }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flex: 1, width: "100%" }}>
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 3, sm: 4, md: 6 },
            px: { xs: 2, sm: 3, md: 4 },
            minHeight: { xs: "calc(100dvh - 128px)", md: "calc(100dvh - 120px)" },
          }}
        >
          <Outlet />
        </Container>
      </Box>

      <Box component="footer" sx={{ borderTop: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", mt: "auto" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={3} alignItems={{ md: "center" }}>
            <Box>
              <BrandMark />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25, maxWidth: 360 }}>
                Mechanical watches to discover, compare, and request.
              </Typography>
            </Box>
            <Stack direction="row" spacing={{ xs: 2, sm: 4 }} flexWrap="wrap" useFlexGap>
              <Button component={RouterLink} to="/shop" color="inherit" size="small">Shop</Button>
              <Button component={RouterLink} to="/#how-it-works" color="inherit" size="small">How it works</Button>
              <Button component={RouterLink} to="/account/orders" color="inherit" size="small">Orders</Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} Mechora
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default ResponsiveLayout;
