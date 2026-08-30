import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { loginUser, selectAuth } from "@/features/auth/authSlice";
import { getErrorMessage } from "@/utils/errors";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";

const highlights = [
  {
    title: "Live concierge desk",
    detail: "Message Swiss-certified watchmakers for macro inspections.",
  },
  {
    title: "Escrow & insurance",
    detail: "Every transaction backed by Lloyd's and tracked courier partners.",
  },
  {
    title: "Unified portfolio",
    detail: "Monitor valuations, servicing, and exit options in one OS.",
  },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const { authStatus, authError } = useSelector(selectAuth);
  const isLoading = authStatus === "loading";

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      const redirect = searchParams.get("redirect");
      navigate(redirect?.startsWith("/") ? redirect : "/account");
    } catch (err) {
      setError(err || "Something went wrong. Try again.");
    }
  };

  const ambient = useMemo(
    () =>
      theme.palette.mode === "dark"
        ? "radial-gradient(circle at 10% 20%, rgba(79,70,229,0.25), transparent 55%), radial-gradient(circle at 80% -20%, rgba(14,165,233,0.2), transparent 45%)"
        : "radial-gradient(circle at 10% 20%, rgba(251,191,36,0.15), transparent 55%), radial-gradient(circle at 80% -10%, rgba(99,102,241,0.15), transparent 40%)",
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
        <Paper elevation={0} sx={{ borderRadius: 5, overflow: "hidden" }}>
          <Grid container>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 4, md: 5 },
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #202125, #111214)"
                    : "linear-gradient(135deg, #ebe3d5, #f8f5ee)",
                color: theme.palette.mode === "dark" ? "#f8fafc" : theme.palette.text.primary,
              }}
            >
              <Stack spacing={2} maxWidth={420}>
                <Typography variant="overline" sx={{ color: "inherit", opacity: 0.8 }}>
                  Concierge access
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  Welcome back to Mechora
                </Typography>
                <Typography
                  sx={{
                    color: alpha(
                      theme.palette.common.white,
                      theme.palette.mode === "dark" ? 0.8 : 0.6
                    ),
                  }}
                >
                  Monitor your portfolio, request sourcing, and chat with our Geneva desk from one secure dashboard.
                </Typography>
                <Stack spacing={2} mt={2}>
                  {highlights.map((item) => (
                    <Stack direction="row" spacing={1.5} key={item.title}>
                      <CheckCircleRoundedIcon fontSize="small" />
                      <Box>
                        <Typography fontWeight={600}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: "inherit", opacity: 0.8 }}>
                          {item.detail}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
                <Stack direction="row" spacing={1} mt={4} flexWrap="wrap">
                  {["24/7 desk", "Escrow insurance", "Global delivery"].map((badge) => (
                    <Chip
                      key={badge}
                      label={badge}
                      size="small"
                      sx={{
                        bgcolor: alpha(
                          theme.palette.common.black,
                          theme.palette.mode === "dark" ? 0.4 : 0.1
                        ),
                        color: "inherit",
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: { xs: 4, md: 5 } }}>
              <Stack spacing={2} mb={3}>
                <Typography variant="overline" color="text.secondary">
                  Sign in
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  Continue to dashboard
                </Typography>
                <Typography color="text.secondary">
                  Enter your credentials to access collections, trades, and concierge.
                </Typography>
              </Stack>

              {(error || authError) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {getErrorMessage({ error: error || authError }, "Unable to sign in")}
                </Alert>
              )}

              <Stack
                component="form"
                spacing={3}
                onSubmit={handleSubmit}
                noValidate
              >
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailError("");
                    setError("");
                  }}
                  error={Boolean(emailError)}
                  helperText={emailError}
                  disabled={isLoading}
                  autoComplete="email"
                  required
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
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
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

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Need an account?
                    </Typography>
                    <Link component={RouterLink} to="/registration" fontWeight={600}>
                      Start here
                    </Link>
                  </Stack>
                  <Link component={RouterLink} to="/password-reset" color="text.secondary">
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={isLoading || !email || !password}
                  endIcon={!isLoading && <ArrowForwardIcon />}
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
                  {isLoading ? "Signing In..." : "Login"}
                </Button>
              </Stack>

              <Divider sx={{ my: 4 }}>or</Divider>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button component={RouterLink} to="/registration" variant="outlined" fullWidth>
                  Create a Mechora ID
                </Button>
                <Button variant="text" component={RouterLink} to="/" fullWidth>
                  Back to home
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <FloatingThemeToggle />
    </Box>
  );
};

export default Login;
