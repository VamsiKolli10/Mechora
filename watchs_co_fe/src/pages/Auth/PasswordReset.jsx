import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Container,
  CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import api from "@/utils/api";
import { isSupabaseAuthConfigured, supabase } from "@/services/supabaseClient";

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isResetMode = Boolean(token || searchParams.get("mode") === "reset");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSupabaseAuthConfigured) {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/password-reset?mode=reset`,
        }).then(({ error }) => {
          if (error) throw error;
        });
      } else {
        await api.post("/api/auth/password-reset/request", { email });
      }
      setSuccess("If the email exists, a password reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Basic password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      if (isSupabaseAuthConfigured) {
        await supabase.auth.updateUser({ password }).then(({ error }) => {
          if (error) throw error;
        });
        await supabase.auth.signOut();
      } else {
        await api.post("/api/auth/password-reset", { token, password });
      }
      setSuccess("Password reset successfully. You can now login with your new password.");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Button
          component={Link}
          to="/login"
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          Back to Login
        </Button>

        {isResetMode ? (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Reset Your Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your new password below.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleResetPassword}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : "Reset Password"}
                </Button>
              </Stack>
            </form>
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleRequestReset}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
                </Button>
              </Stack>
            </form>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PasswordReset;
