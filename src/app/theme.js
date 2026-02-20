// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#64748b",
    },
  },
  typography: {
    fontFamily: "Cairo, sans-serif",
  },
});

export default theme;
