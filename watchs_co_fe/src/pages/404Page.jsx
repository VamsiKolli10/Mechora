import { Link } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const ErrorPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
      }}
    >
      <Typography variant="h2" fontWeight="bold" mb={2}>
        404
      </Typography>
      <Typography variant="h5" mb={3}>
        Oops! Page not found.
      </Typography>
      <Typography variant="body1" mb={4}>
        The page you’re looking for doesn’t exist or has been moved.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        sx={{ textTransform: "none", fontWeight: "bold" }}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default ErrorPage;
