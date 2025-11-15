import { Box, Typography, Grid, Paper } from "@mui/material";

const sampleWatches = [
  { name: "Rolex Submariner", price: "$8999" },
  { name: "Omega Speedmaster", price: "$7299" },
  { name: "Tag Heuer Carrera", price: "$3999" },
];

const FeaturedWatches = () => {
  return (
    <Box className="featured-watches">
      <Typography variant="h5" className="section-title">
        Featured Watches
      </Typography>
      <Grid container spacing={3}>
        {sampleWatches.map((watch, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Paper className="watch-card" elevation={3}>
              <Box className="watch-image" />
              <Typography variant="h6">{watch.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {watch.price}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedWatches;
