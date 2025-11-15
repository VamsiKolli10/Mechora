import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#1d1d1d" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            Mechora
          </Typography>

          <Box>
            {!isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/registration"
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Typography component="span" sx={{ mx: 1 }}>
                  {user?.name || user?.email}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/home"
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Home
                </Button>
                <Button onClick={handleLogout} color="inherit" sx={{ mx: 1 }}>
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ minHeight: "calc(100vh - 64px)" }}>
        <Outlet />
      </Box>
    </>
  );
};

export default MainLayout;
