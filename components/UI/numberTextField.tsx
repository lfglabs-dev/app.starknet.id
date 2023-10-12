import React, { FunctionComponent } from "react";
import styles from "../../styles/components/textField.module.css";
import { InputAdornment, OutlinedInputProps, Tooltip } from "@mui/material";
import InfoIcon from "./iconsComponents/icons/infoIcon";
import { TextField as TextFieldMui } from "@mui/material";

type NumberTextFieldProps = {
  label: string;
  value: number;
  onChange: OutlinedInputProps["onChange"];
  color: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  incrementValue: () => void;
  decrementValue: () => void;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  type?: React.InputHTMLAttributes<unknown>["type"];
  placeholder?: string;
  helperText?: string;
};

const NumberTextField: FunctionComponent<NumberTextFieldProps> = ({
  label,
  value,
  onChange,
  incrementValue,
  decrementValue,
  color,
  required = false,
  error = false,
  errorMessage,
  placeholder,
  helperText,
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex gap-1 my-1">
        {helperText ? (
          <Tooltip
            className="cursor-pointer"
            title={helperText}
            placement="top"
          >
            <div>
              <InfoIcon width="20px" color={error ? "red" : "#454545"} />
            </div>
          </Tooltip>
        ) : null}
        {error ? (
          <p className={styles.errorLegend}>{errorMessage}</p>
        ) : (
          <p className={styles.legend}>{label}</p>
        )}
        {required ? "*" : ""}
      </div>

      <TextFieldMui
        fullWidth
        type="te"
        error={error}
        value={value}
        variant="outlined"
        onChange={onChange}
        color={color}
        sx={{
          "& .css-1s8tl8g-MuiInputBase-root-MuiOutlinedInput-root": {
            fontFamily: "Poppins-Regular",
            borderRadius: "7.983px",
          },
        }}
        InputProps={{
          classes: {
            input: styles.textfieldNumber,
          },
          startAdornment: (
            <InputAdornment
              className="cursor-pointer"
              position="start"
              onClick={decrementValue}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <rect
                  x="0.160156"
                  y="0.228027"
                  width="24"
                  height="24"
                  rx="6"
                  fill="#EAE0D5"
                />
                <path
                  d="M18.1602 12.978H6.16016C5.75016 12.978 5.41016 12.638 5.41016 12.228C5.41016 11.818 5.75016 11.478 6.16016 11.478H18.1602C18.5702 11.478 18.9102 11.818 18.9102 12.228C18.9102 12.638 18.5702 12.978 18.1602 12.978Z"
                  fill="#454545"
                />
              </svg>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment
              className="cursor-pointer"
              position="end"
              onClick={incrementValue}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <rect
                  x="0.84375"
                  y="0.228027"
                  width="24"
                  height="24"
                  rx="6"
                  fill="#EAE0D5"
                />
                <path
                  d="M18.8438 12.978H6.84375C6.43375 12.978 6.09375 12.638 6.09375 12.228C6.09375 11.818 6.43375 11.478 6.84375 11.478H18.8438C19.2537 11.478 19.5938 11.818 19.5938 12.228C19.5938 12.638 19.2537 12.978 18.8438 12.978Z"
                  fill="#454545"
                />
                <path
                  d="M12.8438 18.978C12.4338 18.978 12.0938 18.638 12.0938 18.228V6.22803C12.0938 5.81803 12.4338 5.47803 12.8438 5.47803C13.2537 5.47803 13.5938 5.81803 13.5938 6.22803V18.228C13.5938 18.638 13.2537 18.978 12.8438 18.978Z"
                  fill="#454545"
                />
              </svg>{" "}
            </InputAdornment>
          ),
        }}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
};

export default NumberTextField;
