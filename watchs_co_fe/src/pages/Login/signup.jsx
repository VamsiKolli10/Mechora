import { useMemo, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signupUser } from "@/features/auth/authSlice";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Link,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

const onboardingSteps = [
  {
    title: "Signal your wish list",
    detail: "Tell us the maisons or independents you're tracking.",
  },
  {
    title: "Unlock concierge",
    detail: "We assign a Swiss-certified watchmaker within 24 hours.",
  },
  {
    title: "Collect & care",
    detail: "Secure delivery, aftercare, and resale strategy from one OS.",
  },
];

const conciergeStats = [
  { label: "Maison partners", value: "54" },
  { label: "Private allocations", value: "11" },
  { label: "Cities served", value: "38" },
];

const collectorFaces = [
  { initials: "AV" },
  { initials: "NR" },
  { initials: "HK" },
  { initials: "+" },
];

const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
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

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? "");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setEmailError("");
    setPasswordError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(form.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const result = await dispatch(signupUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })).unwrap();

      setSnackbar({
        open: true,
        message: result.pendingConfirmation
          ? result.message
          : "Signup successful! Redirecting...",
        severity: "success",
      });

      setTimeout(
        () => navigate(result.pendingConfirmation ? "/login" : "/account"),
        result.pendingConfirmation ? 4000 : 2000
      );
    } catch (error) {
      const message = error || "Signup failed. Please try again.";
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  const ambient = useMemo(
    () =>
      theme.palette.mode === "dark"
        ? "radial-gradient(circle at 0 0, rgba(248,250,252,0.1), transparent 45%), radial-gradient(circle at 90% 10%, rgba(124,58,237,0.2), transparent 50%)"
        : "radial-gradient(circle at 0 0, rgba(253,230,138,0.25), transparent 45%), radial-gradient(circle at 90% 10%, rgba(147,197,253,0.3), transparent 50%)",
    [theme]
  );

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 6, md: 8 },
        background: ambient,
      }}
    >
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems="stretch"
            divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: "none", lg: "block" }, borderColor: "rgba(255,255,255,0.05)" }} />}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", lg: 0 },
                p: { xs: 4, md: 5 },
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(145deg, #202125, #111214)"
                    : "linear-gradient(145deg, #ebe3d5, #faf7f0)",
                color: theme.palette.mode === "dark" ? "#f8fafc" : theme.palette.text.primary,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 0 0, rgba(255,255,255,0.25), transparent 50%), radial-gradient(circle at 100% 0, rgba(15,23,42,0.4), transparent 45%)",
                  opacity: 0.4,
                }}
              />
              <Stack spacing={3} position="relative">
                <Chip
                  label="Concierge onboarding"
                  color="secondary"
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="h3" fontWeight={600}>
                  Start your concierge journey
                </Typography>
                <Typography sx={{ color: alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.85 : 0.65) }}>
                  Gain access to rare allocations, invite-only salons, and a dedicated watchmaker team.
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {collectorFaces.map((collector) => (
                    <Avatar
                      key={collector.initials}
                      sx={{
                        bgcolor: alpha(theme.palette.common.black, 0.25),
                        color: "inherit",
                        border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`,
                      }}
                    >
                      {collector.initials}
                    </Avatar>
                  ))}
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.75) }}>
                    Trusted by 6,000+ collectors worldwide
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  {onboardingSteps.map((step, index) => (
                    <Stack direction="row" spacing={2} key={step.title}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "16px",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(theme.palette.common.black, 0.3),
                          fontWeight: 600,
                          fontSize: 18,
                        }}
                      >
                        0{index + 1}
                      </Box>
                      <Box>
                        <Typography fontWeight={600}>{step.title}</Typography>
                        <Typography variant="body2" sx={{ color: "inherit", opacity: 0.85 }}>
                          {step.detail}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
                <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.2) }} />
                <Grid container spacing={2}>
                  {conciergeStats.map((stat) => (
                    <Grid item xs={4} key={stat.label}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h5" fontWeight={600}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: alpha("#000", 0.35),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    color: "inherit",
                  }}
                >
                  <Typography variant="overline" sx={{ color: "inherit", opacity: 0.7 }}>
                    Concierge seats
                  </Typography>
                  <Typography fontWeight={600} variant="h5">
                    11 private allocations left this quarter
                  </Typography>
                  <Typography variant="body2" sx={{ color: "inherit", opacity: 0.7 }}>
                    Rolex, AP, Patek and Journe boutique programs.
                  </Typography>
                </Paper>
              </Stack>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", lg: 0 },
                p: { xs: 4, md: 5 },
                backgroundColor: theme.palette.mode === "dark" ? "#050714" : theme.palette.background.default,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  width: "100%",
                  backgroundColor: theme.palette.background.paper,
                  maxWidth: 520,
                }}
                elevation={0}
              >
                <Stack spacing={2} mb={2}>
                  <Typography variant="overline" color="text.secondary">
                    Join Mechora
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    Create your account
                  </Typography>
                  <Typography color="text.secondary">
                    We'll verify your details to pair you with a concierge team.
                  </Typography>
                </Stack>

                {(emailError || passwordError) && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {emailError || passwordError}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack spacing={3}>
                    <TextField
                      label="Full name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineRoundedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-focused": {
                            transform: "translateY(-1px)",
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      error={Boolean(emailError)}
                      helperText={emailError}
                      autoComplete="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-focused": {
                            transform: "translateY(-1px)",
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-focused": {
                            transform: "translateY(-1px)",
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Confirm password"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      error={Boolean(passwordError)}
                      helperText={passwordError}
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-focused": {
                            transform: "translateY(-1px)",
                          },
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      disabled={!form.name || !form.email || !form.password || !form.confirmPassword}
                      sx={{
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover:not(:disabled)": {
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
                      Sign up
                    </Button>
                  </Stack>
                </Box>

                <Divider sx={{ my: 3 }}>or</Divider>
                <Stack spacing={2}>
                  <Button component={RouterLink} to="/login" variant="outlined">
                    Already have an account? Login
                  </Button>
                  <Button variant="text" href="#concierge">
                    Talk to concierge instead
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <FloatingThemeToggle />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Registration;
