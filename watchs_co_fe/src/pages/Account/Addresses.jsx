import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, CheckCircle } from "@mui/icons-material";
import api from "@/utils/api";

const AccountAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    type: "shipping",
    label: "",
    name: "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/account/addresses");
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        type: "shipping",
        label: "",
        name: "",
        street: "",
        street2: "",
        city: "",
        state: "",
        zip: "",
        country: "US",
        phone: "",
        is_default: false,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAddress) {
        await api.put(`/api/account/addresses/${editingAddress.id}`, formData);
      } else {
        await api.post("/api/account/addresses", formData);
      }
      fetchAddresses();
      handleClose();
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await api.delete(`/api/account/addresses/${id}`);
        fetchAddresses();
      } catch (error) {
        console.error("Failed to delete address:", error);
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/api/account/addresses/${id}/default`);
      fetchAddresses();
    } catch (error) {
      console.error("Failed to set default address:", error);
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
          Addresses
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Address
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {addresses.map((address) => (
          <Grid item xs={12} md={6} key={address.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box>
                      {address.is_default && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Default"
                          color="primary"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                      {address.label && (
                        <Typography variant="h6">{address.label}</Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {address.type}
                      </Typography>
                    </Box>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => handleOpen(address)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(address.id)}>
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Typography variant="body1">
                    {address.name}
                    <br />
                    {address.street}
                    {address.street2 && <>, {address.street2}</>}
                    <br />
                    {address.city}, {address.state} {address.zip}
                    <br />
                    {address.country}
                    {address.phone && (
                      <>
                        <br />
                        {address.phone}
                      </>
                    )}
                  </Typography>
                  {!address.is_default && (
                    <Button
                      size="small"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAddress ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="shipping">Shipping</MenuItem>
                    <MenuItem value="billing">Billing</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Label (e.g., Home, Work)"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Apartment, suite, etc."
                  value={formData.street2}
                  onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    label="Country"
                  >
                    <MenuItem value="US">United States</MenuItem>
                    <MenuItem value="CA">Canada</MenuItem>
                    <MenuItem value="UK">United Kingdom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAddress ? "Update" : "Add"} Address
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountAddresses;

