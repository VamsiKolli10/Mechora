import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils/errors";
import { supabase } from "@/services/supabaseClient";
import { fetchCurrentUser } from "@/features/auth/authSlice";

const AccountProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const providerEmailChange = user.auth_provider === "supabase" && formData.email.toLowerCase() !== user.email.toLowerCase();
      if (providerEmailChange && !supabase) throw new Error("Your identity provider is not configured. Please contact support to change your email.");
      if (providerEmailChange) {
        const { error } = await supabase.auth.updateUser({ email: formData.email });
        if (error) throw error;
      }
      const { data } = await api.put("/api/account/profile", providerEmailChange ? { name: formData.name } : formData);
      setSuccess(providerEmailChange
        ? `Profile saved. Follow the confirmation emails to change your sign-in email to ${formData.email}.`
        : data.verification_sent === false
          ? "Profile saved, but the verification email could not be sent. Save again to retry."
          : data.verification_sent ? "Profile saved. Check your email to verify your address." : "Profile updated successfully");
      await dispatch(fetchCurrentUser());
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Profile Settings
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Update Profile"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default AccountProfile;

