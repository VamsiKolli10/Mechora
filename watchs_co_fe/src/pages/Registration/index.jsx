import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  Box,
  Link,
  Snackbar,
} from "@mui/material";
import api from "@/utils/api";

const Registration = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // or "error"
  });

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setEmailError("");
    setPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(form.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await api.post(`/api/auth/signup`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSnackbar({
        open: true,
        message: "Signup successful! Redirecting...",
        severity: "success",
      });

      // Delay redirect by 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const message =
        err.response?.data?.error || "Signup failed. Please try again.";
      setSnackbar({
        open: true,
        message,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #6a11cb, #2575fc)",
          padding: 2,
        }}
      >
        <Grid item xs={12} sm={8} md={5}>
          <Paper
            elevation={10}
            sx={{
              padding: 6,
              borderRadius: 4,
              backgroundColor: "#fff",
              boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#333" }}
            >
              Create Your Account
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ marginBottom: 3, color: "#666" }}
            >
              Sign up to get started
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
                error={!!emailError}
                helperText={emailError}
              />

              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                fullWidth
                required
                error={!!passwordError}
                helperText={passwordError}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  py: 1.5,
                  fontSize: "1rem",
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Typography
              variant="body2"
              align="center"
              sx={{ marginTop: 3, color: "#555" }}
            >
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ fontWeight: 600, color: "#2575fc" }}
              >
                Login
              </Link>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Registration;
