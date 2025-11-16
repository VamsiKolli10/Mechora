import { Stack, Typography } from "@mui/material";

const SectionHeading = ({ eyebrow, title, subtitle, action }) => (
  <Stack
    spacing={1}
    direction={{ xs: "column", md: "row" }}
    alignItems={{ xs: "flex-start", md: "center" }}
    justifyContent="space-between"
    mb={{ xs: 2, md: 3 }}
    sx={{
      "& .MuiTypography-h4": {
        fontSize: { xs: "1.75rem", md: "2.125rem" },
      },
    }}
  >
    <Stack spacing={0.5}>
      {eyebrow && (
        <Typography variant="overline" color="text.secondary">
          {eyebrow}
        </Typography>
      )}
      {title && (
        <Typography variant="h4" fontWeight={600}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography color="text.secondary">{subtitle}</Typography>
      )}
    </Stack>
    {action}
  </Stack>
);

export default SectionHeading;
