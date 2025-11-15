import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Paper,
  TextField,
  Typography,
  Button,
  Box,
  Link,
  Alert,
} from "@mui/material";
import { loginUser, selectAuth } from "@/features/auth/authSlice";
import "./login.css";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { authStatus, authError } = useSelector(selectAuth);
  const isLoading = authStatus === "loading";

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate("/");
    } catch (err) {
      setError(err || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="login-container">
      <Paper elevation={6} className="login-card">
        {/* <Typography variant="h4" className="login-title">
          Login
        </Typography> */}
        <div className="logo-wrapper">
          <img src="/logo.png" alt="Mechora Logo" className="login-logo" />
        </div>

        {(error || authError) && (
          <Alert severity="error" className="login-error">
            {error || authError}
          </Alert>
        )}

        <Box
          component="form"
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            label="Email"
            fullWidth
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            error={!!emailError}
            helperText={emailError}
            required
          />

          <TextField
            label="Password"
            fullWidth
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            variant="contained"
            fullWidth
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Login"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ marginTop: "1.5rem", color: "#555" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            component={RouterLink}
            to="/registration"
            underline="hover"
            sx={{ fontWeight: 600, color: "#2575fc" }}
          >
            Sign up
          </Link>
        </Typography>
      </Paper>
    </div>
  );
};

export default Login;
