// src/components/HeroBanner.jsx
import { useEffect, useState } from "react";
import { heroSlides } from "@/constants/heroSlides";
import { Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "./index.css";

const HeroBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const { image, title, subtitle, ctaText, ctaLink } = heroSlides[index];

  return (
    <Box
      className={`hero-banner slide`}
      sx={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Box className="hero-overlay">
        <Container maxWidth="lg">
          <Box className="hero-content">
            <Typography variant="h2" className="hero-title">
              {title}
            </Typography>
            <Typography variant="h5" className="hero-subtitle">
              {subtitle}
            </Typography>
            <Button
              component={RouterLink}
              to={ctaLink}
              variant="contained"
              className="hero-button"
            >
              {ctaText}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HeroBanner;
