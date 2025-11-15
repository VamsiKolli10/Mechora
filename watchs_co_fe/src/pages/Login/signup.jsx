import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  Box,
  Link,
  Snackbar,
} from "@mui/material";
import { API_BASE_URL } from "@/constants/env";
import "./login.css";

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
    severity: "success",
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
      await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSnackbar({
        open: true,
        message: "Signup successful! Redirecting...",
        severity: "success",
      });

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
      <div className="login-container">
        <Paper elevation={10} className="login-card">
          <Typography variant="h4" className="login-title">
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
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
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
              fullWidth
              className="login-button"
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
      </div>

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
