import { Checkbox } from "@mui/material";
import React, { FunctionComponent } from "react";
import styles from "../../styles/components/variants.module.css";

type TermCheckboxProps = {
  checked: boolean;
  onChange: () => void;
  variant?: "default" | "white";
};

const TermCheckbox: FunctionComponent<TermCheckboxProps> = ({
  checked,
  onChange,
  variant,
}) => {
  return (
    <div className="flex items-center justify-left text-xs mr-2">
      <Checkbox
        checked={checked}
        className={
          variant === "white" ? styles.whiteCheckbox : styles.defaultCheckbox
        }
        onClick={onChange}
      />
      <p className="ml-2 text-left">
        <span className="cursor-pointer" onClick={onChange}>
          Accept
        </span>{" "}
        <a
          className="underline"
          href={process.env.NEXT_PUBLIC_STARKNET_ID + "/pdfs/Terms.pdf"}
          target="_blank"
          rel="noreferrer"
        >
          terms
        </a>{" "}
        &{" "}
        <a
          className="underline"
          href={process.env.NEXT_PUBLIC_STARKNET_ID + "/pdfs/PrivacyPolicy.pdf"}
          target="_blank"
          rel="noreferrer"
        >
          policies
        </a>
      </p>
    </div>
  );
};

export default TermCheckbox;
