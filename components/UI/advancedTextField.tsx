import React, { FunctionComponent } from "react";
import { OutlinedInputProps, TextFieldProps } from "@mui/material";
import { TextField } from "@mui/material";

type AdvancedTextFieldProps = {
  label: string;
  value: string;
  fullWidth?: boolean;
  onChange: OutlinedInputProps["onChange"];
  color: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  required?: boolean;
  error?: boolean;
  InputProps?: TextFieldProps["InputProps"];
};

const AdvancedTextField: FunctionComponent<AdvancedTextFieldProps> = ({
  label,
  value,
  fullWidth = true,
  onChange,
  color,
  required = false,
  error = false,
  InputProps,
}) => {
  return (
    <div className="flex flex-col justify-center w-full bg-[#FCFFFE]">
      <TextField
        value={value}
        fullWidth={fullWidth}
        id="outlined-basic"
        label={label}
        placeholder=""
        variant="outlined"
        onChange={onChange}
        color={color}
        error={error}
        required={required}
        sx={{
          borderRadius: "8px",
          width: "100%",
          backgroundColor: "#ffffff",
          "& label": {
            color: "#45454533",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            transition: "all 0.2s ease-in-out",
            position: "absolute",
            pointerEvents: "none",
          },
          "& .MuiInputLabel-root": {
            left: "50%",
            transform: "translate(-50%, -50%)",
          },
          "& .MuiInputLabel-shrink": {
            left: "10px",
            top: "0px",
            paddingLeft: "6px",
            transform: "translate(0, -8.5px) scale(0.75) !important",
          },
          "& .MuiOutlinedInput-root": {
            height: "62px",
            width: "full",
            boxShadow: "0px 2px 30px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "rgba(69, 69, 69, 0.20)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#19AA6E",
            },
          },
        }}
        inputProps={{
          style: { height: "60px", textAlign: "center" },
        }}
        InputProps={InputProps}
      />
    </div>
  );
};

export default AdvancedTextField;
