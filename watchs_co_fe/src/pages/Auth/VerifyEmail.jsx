import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Container,
  CircularProgress,
} from "@mui/material";
import api from "@/utils/api";
import { isSupabaseAuthConfigured, supabase } from "@/services/supabaseClient";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token || isSupabaseAuthConfigured ? "loading" : "idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      setStatus("loading");
      setMessage("");
      try {
        let verificationMessage;
        if (token) {
          const { data } = await api.post("/api/auth/verify-email", { token });
          verificationMessage = data.message;
        } else if (isSupabaseAuthConfigured) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) {
            if (isMounted) setStatus("idle");
            return;
          }
          verificationMessage = "Email verified successfully. You can continue to your account.";
        } else {
          if (isMounted) setStatus("idle");
          return;
        }
        if (!isMounted) return;
        setStatus("success");
        setMessage(verificationMessage || "Email verified successfully.");
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(err.response?.data?.error || err.message || "Failed to verify email.");
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Verify your email
        </Typography>

        {status === "idle" && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Use the verification link from your email to confirm your account.
          </Alert>
        )}

        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {status === "success" && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {status === "error" && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/login" variant="contained">
            Back to Login
          </Button>
          <Button component={Link} to="/" variant="outlined">
            Home
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
