import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#19aa6e",
      light: "#dcf2e9",
    },
    secondary: {
      main: "#402d28",
      light: "#eae0d5",
    },
    background: {
      default: "#FFF",
    },
    grey: {
      200: "#CDCCCC",
      800: "#454545",
    },
    error: {
      main: "#d32f2f",
      light: "#f6d5d5",
    },
  },
});

export default theme;
