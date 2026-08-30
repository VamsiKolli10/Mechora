import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  Stack,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import MiniCart from "@/components/MiniCart";

const navItems = [
  { label: "Shop all", path: "/shop" },
  {
    label: "New arrivals",
    path: "/shop?sort_by=created_at&sort_order=DESC",
  },
  { label: "Available now", path: "/shop?stock_status=in_stock" },
  { label: "Concierge", path: "/#concierge" },
];

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const scrollToSection = (hash, isInitialLoad = false) => {
    if (!hash) return;

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

    if (isInitialLoad) {
      // On page refresh, wait longer for everything to render
      if (document.readyState === "complete") {
        // Page already loaded, wait for React to finish rendering
        setTimeout(() => scrollToElement(), 400);
      } else {
        // Wait for page to fully load
        const handleLoad = () => {
          setTimeout(() => scrollToElement(), 400);
        };
        window.addEventListener("load", handleLoad, { once: true });
      }
    } else {
      // Normal navigation, shorter delay
      setTimeout(() => scrollToElement(), 150);
    }
  };

  const isNavItemActive = (path) => {
    if (path.includes("#")) {
      const [route, hash] = path.split("#");
      const targetRoute = route || "/";
      const routeMatch =
        location.pathname === targetRoute ||
        (!route && location.pathname === "/");
      return routeMatch && location.hash === `#${hash}`;
    }

    if (path === "/" || path === "") {
      return location.pathname === "/" && !location.hash;
    }

    if (path.includes("?")) {
      const [pathname, query] = path.split("?");
      const expected = new URLSearchParams(query);
      const current = new URLSearchParams(location.search);
      return (
        location.pathname === pathname &&
        [...expected.entries()].every(
          ([key, value]) => current.get(key) === value
        )
      );
    }

    return location.pathname === path && !location.search;
  };

  const handleNavClick = (path, onItemClick) => {
    onItemClick();
    if (path.includes("#")) {
      const [route, hash] = path.split("#");
      const targetPath = route || "/";

      const onLanding =
        location.pathname === targetPath ||
        (!route && location.pathname === "/");

      if (onLanding) {
        // Already on the page, just scroll
        scrollToSection(hash);
      } else {
        // Navigate first, then scroll after navigation
        navigate(targetPath + "#" + hash);
        setTimeout(() => scrollToSection(hash), 300);
      }
    } else {
      // No hash, navigate normally (Collections link)
      const targetPath = path || "/";
      const currentPath = `${location.pathname}${location.search}`;
      if (currentPath !== targetPath) {
        // Navigate to the path and remove any hash
        navigate(targetPath);
        // Scroll to top for Collections after navigation
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 200);
      } else {
        // Already on Collections page, scroll to top and remove hash if present
        if (location.hash) {
          navigate(targetPath, { replace: true });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Handle hash changes when location changes
  useEffect(() => {
    if (location.hash && location.pathname === "/") {
      // Check if this is an initial page load (no navigation state)
      const isInitialLoad =
        !window.history.state || window.history.state.key === null;
      scrollToSection(location.hash.substring(1), isInitialLoad);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, location.pathname]);

  const renderNavItems = (direction = "row", onItemClick = () => {}) => (
    <Stack direction={direction} spacing={direction === "row" ? 2 : 1}>
      {navItems.map((item) => (
        <Button
          key={item.path}
          component={RouterLink}
          to={item.path}
          onClick={() => handleNavClick(item.path, onItemClick)}
          sx={{
            justifyContent: direction === "row" ? "center" : "flex-start",
            fontWeight: 500,
            color: theme.palette.text.primary,
            borderRadius: 999,
            px: direction === "row" ? 2 : 1.5,
            textTransform: "none",
            borderBottom: isNavItemActive(item.path)
              ? `2px solid ${theme.palette.primary.main}`
              : "2px solid transparent",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: alpha(theme.palette.text.primary, 0.08),
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
          aria-label={`Navigate to ${item.label}`}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          py: 0.9,
          px: 2,
          textAlign: "center",
          bgcolor: "text.primary",
          color: "background.default",
        }}
      >
        <Typography variant="caption" fontWeight={700}>
          Complimentary insured shipping on orders over $5,000 · 7-day returns
        </Typography>
      </Box>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Toolbar disableGutters>
          <Container
            maxWidth="xl"
            sx={{ display: "flex", alignItems: "center", py: 1.5 }}
          >
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                fontWeight: 700,
                letterSpacing: "-0.05em",
                flexGrow: { xs: 1, lg: 0 },
                color: "text.primary",
              }}
            >
              Mechora
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{
                flexGrow: 1,
                justifyContent: "center",
                display: { xs: "none", md: "flex" },
              }}
            >
              {renderNavItems()}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component={RouterLink}
                to="/shop"
                variant="contained"
                size="small"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  mr: 1,
                  backgroundImage:
                    "linear-gradient(120deg, #282722, #4b463d)",
                  color: "#fff",
                  "&:hover": {
                    backgroundImage:
                      "linear-gradient(120deg, #3b3932, #675f52)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Shop Watches
              </Button>
              <MiniCart />
              <ThemeToggle />
              <IconButton
                aria-label="open navigation"
                aria-expanded={drawerOpen}
                onClick={toggleDrawer}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  color: theme.palette.text.primary,
                  border: `1px solid ${alpha(
                    theme.palette.text.primary,
                    0.15
                  )}`,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.text.primary, 0.08),
                    transform: "scale(1.05)",
                  },
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
              {!isAuthenticated ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="small"
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/registration"
                    variant="contained"
                    size="small"
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
                      },
                    }}
                  >
                    Join
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/account"
                    variant="text"
                    size="small"
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      color: theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.text.primary,
                          0.08
                        ),
                      },
                    }}
                  >
                    Account
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="text"
                    size="small"
                    sx={{
                      display: { xs: "none", md: "inline-flex" },
                      color: theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.text.primary,
                          0.08
                        ),
                      },
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: 280,
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2 }}
        >
          <Typography variant="h6">Menu</Typography>
          <IconButton onClick={toggleDrawer}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/shop"
              onClick={toggleDrawer}
            >
              <ListItemText primary="Shop Watches" />
            </ListItemButton>
          </ListItem>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => handleNavClick(item.path, toggleDrawer)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
          {isAuthenticated && (
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/account" onClick={toggleDrawer}>
                <ListItemText primary="My Account" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
        <Stack spacing={1} sx={{ p: 2 }}>
          {!isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                onClick={toggleDrawer}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/registration"
                variant="contained"
                onClick={toggleDrawer}
              >
                Join
              </Button>
            </>
          ) : (
            <Button onClick={handleLogout} variant="text">
              Logout
            </Button>
          )}
        </Stack>
      </Drawer>
      <Container
        component="main"
        maxWidth="xl"
        sx={{ py: { xs: 4, md: 6 }, minHeight: "calc(100vh - 80px)" }}
      >
        <Outlet />
      </Container>
      <Box
        component="footer"
        sx={{
          mt: 8,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.65),
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
          <Box
            sx={{
              display: "grid",
              gap: 4,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "2fr 1fr 1fr 1fr",
              },
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Mechora
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 340 }}>
                Authenticated watches, transparent pricing, and insured delivery
                for collectors everywhere.
              </Typography>
            </Box>
            <Stack spacing={1.25}>
              <Typography fontWeight={700}>Shop</Typography>
              <Button component={RouterLink} to="/shop" sx={{ justifyContent: "flex-start", px: 0 }}>
                All watches
              </Button>
              <Button
                component={RouterLink}
                to="/shop?sort_by=created_at&sort_order=DESC"
                sx={{ justifyContent: "flex-start", px: 0 }}
              >
                New arrivals
              </Button>
            </Stack>
            <Stack spacing={1.25}>
              <Typography fontWeight={700}>Account</Typography>
              <Button component={RouterLink} to="/account" sx={{ justifyContent: "flex-start", px: 0 }}>
                My account
              </Button>
              <Button component={RouterLink} to="/cart" sx={{ justifyContent: "flex-start", px: 0 }}>
                Cart
              </Button>
            </Stack>
            <Stack spacing={1.25}>
              <Typography fontWeight={700}>Service</Typography>
              <Button component={RouterLink} to="/#concierge" sx={{ justifyContent: "flex-start", px: 0 }}>
                Concierge
              </Button>
              <Typography variant="body2" color="text.secondary">
                Secure payments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Insured delivery
              </Typography>
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 5 }}>
            © {new Date().getFullYear()} Mechora. Built for watch collectors.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
