import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Person,
  ShoppingBag,
  LocationOn,
  CreditCard,
  ArrowForward,
} from "@mui/icons-material";

const AccountDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        My Account
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Person sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography variant="h6">Profile</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your personal information
                </Typography>
                <Button
                  component={Link}
                  to="/account/profile"
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  fullWidth
                >
                  Edit Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <ShoppingBag sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography variant="h6">Orders</Typography>
                <Typography variant="body2" color="text.secondary">
                  View your order history
                </Typography>
                <Button
                  component={Link}
                  to="/account/orders"
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  fullWidth
                >
                  View Orders
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <LocationOn sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography variant="h6">Addresses</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage shipping addresses
                </Typography>
                <Button
                  component={Link}
                  to="/account/addresses"
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  fullWidth
                >
                  Manage Addresses
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <CreditCard sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography variant="h6">Payment Methods</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage payment methods
                </Typography>
                <Button
                  component={Link}
                  to="/account/payment-methods"
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  fullWidth
                >
                  Manage Cards
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {user && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{user.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>
            {user.email_verified !== undefined && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email Verified
                </Typography>
                <Typography variant="body1">
                  {user.email_verified ? "Yes" : "No"}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default AccountDashboard;

