import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Add, Delete, CheckCircle, CreditCard } from "@mui/icons-material";
import api from "@/utils/api";

const AccountPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/account/payment-methods");
      setPaymentMethods(data);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment method?")) {
      try {
        await api.delete(`/api/account/payment-methods/${id}`);
        fetchPaymentMethods();
      } catch (error) {
        console.error("Failed to delete payment method:", error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/api/account/payment-methods/${id}/default`);
      fetchPaymentMethods();
    } catch (error) {
      console.error("Failed to set default payment method:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Payment Methods
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Payment Method
        </Button>
      </Stack>

      {paymentMethods.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CreditCard sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No payment methods
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a payment method to make checkout faster
          </Typography>
          <Button variant="contained" startIcon={<Add />}>
            Add Payment Method
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CreditCard />
                    <Box>
                      {method.is_default && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Default"
                          color="primary"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                      <Typography variant="h6">
                        {method.brand?.toUpperCase() || method.type} •••• {method.last4}
                      </Typography>
                      {method.expiry_month && method.expiry_year && (
                        <Typography variant="body2" color="text.secondary">
                          Expires {method.expiry_month}/{method.expiry_year}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Stack direction="row">
                    {!method.is_default && (
                      <Button
                        size="small"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <IconButton onClick={() => handleDelete(method.id)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AccountPaymentMethods;

