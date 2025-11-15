// src/pages/Home.jsx
import { useEffect, useRef, useState } from "react";
import {
  Grid,
  Typography,
  CircularProgress,
  Button,
  Box,
  Container,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "./index.css";
import HeroBanner from "./HeroBanner";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const fetchMoreItems = async () => {
    setLoading(true);
    const newItems = Array.from(
      { length: 6 },
      (_, i) => `Watch Model ${items.length + i + 1}`
    );
    await new Promise((res) => setTimeout(res, 1000));
    setItems((prev) => [...prev, ...newItems]);
    setLoading(false);
  };

  useEffect(() => {
    fetchMoreItems();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) fetchMoreItems();
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => loaderRef.current && observer.unobserve(loaderRef.current);
  }, [loading]);

  return (
    <Box className="home-wrapper">
      {/* Promo Banner */}
      <Box className="promo-banner">Free Shipping on All Orders Over $100</Box>

      {/* Hero Section */}
      {/* <Box className="hero-banner">
        <Box className="hero-overlay">
          <Container maxWidth="lg">
            <Box className="hero-content">
              <Typography variant="h2" className="hero-title">
                Timeless Elegance
              </Typography>
              <Typography variant="h5" className="hero-subtitle">
                Discover luxury watches that define your legacy.
              </Typography>
              <Button
                component={RouterLink}
                to="/shop"
                variant="contained"
                className="hero-button"
              >
                Shop Now
              </Button>
            </Box>
          </Container>
        </Box>
      </Box> */}
      <HeroBanner />

      {/* Categories */}
      <Container maxWidth="lg">
        <Typography className="section-title">Shop by Category</Typography>
        <Grid container spacing={2} justifyContent="center" marginBottom={4}>
          {["Luxury", "Sport", "Classic", "Digital"].map((cat, i) => (
            <Grid item key={i}>
              <Box className="category-card">{cat}</Box>
            </Grid>
          ))}
        </Grid>

        {/* Featured Watches */}
        <Typography className="section-title">Featured Watches</Typography>
        <Grid container spacing={3} justifyContent="center">
          {items.map((item, i) => (
            <Grid item xs={10} sm={6} md={4} key={i}>
              <Box className="watch-card">
                <Box className="watch-image" />
                <Typography variant="subtitle1" fontWeight={600}>
                  {item}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Infinite Loader */}
      <Box ref={loaderRef} sx={{ textAlign: "center", padding: 4 }}>
        {loading && <CircularProgress />}
      </Box>
    </Box>
  );
};

export default Home;
