import { Box, Grid, Paper, Typography } from "@mui/material";

const categories = ["Luxury", "Sport", "Classic", "Digital"];

const CategoryGrid = () => {
  return (
    <Box className="category-grid">
      <Typography variant="h5" className="section-title">
        Shop by Category
      </Typography>
      <Grid container spacing={3}>
        {categories.map((cat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Paper className="category-card" elevation={4}>
              <Typography variant="h6">{cat}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryGrid;
