import React, { FunctionComponent } from "react";
import styles from "../../styles/components/textField.module.css";
import { OutlinedInputProps, Tooltip } from "@mui/material";
import InfoIcon from "./iconsComponents/icons/infoIcon";
import { TextField as TextFieldMui } from "@mui/material";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: OutlinedInputProps["onChange"];
  color: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  placeholder?: string;
  helperText?: string;
  type?: React.InputHTMLAttributes<unknown>["type"];
};

const TextField: FunctionComponent<TextFieldProps> = ({
  label,
  value,
  onChange,
  color,
  required = false,
  error = false,
  errorMessage,
  placeholder,
  helperText,
  type,
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
        type={type}
        error={error}
        fullWidth
        value={value}
        variant="outlined"
        onChange={onChange}
        color={color}
        InputProps={{
          classes: {
            root: styles.textfield,
          },
        }}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextField;
