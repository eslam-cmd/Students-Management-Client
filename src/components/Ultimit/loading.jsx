import { Box, Typography, CircularProgress } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        backgroundColor: "#115293",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
      }}
    >
      <SchoolIcon sx={{ fontSize: 80, color: "white" }} />
      <CircularProgress color="inherit" thickness={5} />
      <Typography variant="h6" sx={{ opacity: 0.9 }}>
        Loading...
      </Typography>
    </Box>
  );
}
