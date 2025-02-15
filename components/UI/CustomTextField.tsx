import { TextField, styled } from "@mui/material";

export const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    padding: "5px 35px",
    caretColor: "#454545",
    "& fieldset": {
      border: "1px solid #CDCCCC",
      borderRadius: "8px",
      boxShadow: "0px 2px 30px 0px rgba(0, 0, 0, 0.06)",
      backgroundColor: "#FFFFFF",
    },
    "& .MuiInputBase-input": {
      color: "#454545",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "28px",
      letterSpacing: "0.24px",
      textAlign: "center",
      zIndex: "1",
    },
    "&:hover fieldset": {
      border: "1px solid #CDCCCC",
    },
    "& ::placeholder": {
      color: "rgba(69, 69, 69, 0.2)",
      textAlign: "center",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "28px",
      letterSpacing: "0.24px",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Poppins-Regular",
    },
    "&.Mui-focused ::placeholder": {
      color: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },

  },
  "& .MuiFormHelperText-root": {
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0%",
    textAlign: "center",
    color: "#454545",
    padding: "5px 0",
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiOutlinedInput-root": {
      padding: "0 30px",
      "& .MuiInputBase-input": {
        fontSize: "22px",
        lineHeight: "22px",
        letterSpacing: "0.2px",
      },
      "& ::placeholder": {
        fontSize: "16px",
        lineHeight: "20px",
        letterSpacing: "0.2px",
      },
    },
    "& .MuiFormHelperText-root": {
      fontFamily: "Poppins-Regular",
      fontWeight: "300",
      fontSize: "10px",
      lineHeight: "20px",
      letterSpacing: "0%",
      textAlign: "center",
      color: "#454545",
      padding: "5px 0",
    },
  },
}));
