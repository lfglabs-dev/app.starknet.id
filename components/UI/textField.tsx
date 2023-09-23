import React, { FunctionComponent } from "react";
import styles from "../../styles/components/textField.module.css";
import { OutlinedInputProps } from "@mui/material";
import { TextField as TextFieldMui } from "@mui/material";
import InputHelper from "./inputHelper";

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
        {error ? (
          <p className={styles.errorLegend}>{errorMessage}</p>
        ) : (
          <p className={styles.legend}>{label}</p>
        )}
        {required ? "*" : ""}
      </div>
      <InputHelper helperText={helperText} error={error}>
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
      </InputHelper>
    </div>
  );
};

export default TextField;
