import React, { FunctionComponent } from "react";
import { Checkbox } from "@mui/material";
import styles from "../../styles/components/variants.module.css";

type RegisterCheckboxes = {
  termsBox: boolean;
  renewalBox: boolean;
  onChangeTermsBox: () => void;
  onChangeRenewalBox: () => void;
  variant?: "default" | "white";
  isArOnforced?: boolean;
};

const RegisterCheckboxes: FunctionComponent<RegisterCheckboxes> = ({
  onChangeRenewalBox,
  onChangeTermsBox,
  termsBox,
  renewalBox,
  variant = "default",
  isArOnforced,
}) => {
  return (
    <div className="w-full mb-3">
      <div className="flex mt-2 flex-col gap-3">
        <div
          className="flex items-center justify-left text-xs mr-2 cursor-pointer"
          onClick={onChangeTermsBox}
        >
          <Checkbox
            checked={termsBox}
            className={
              variant === "white"
                ? styles.whiteCheckbox
                : styles.defaultCheckbox
            }
          />
          <p className="ml-2 text-left">
            Accept{" "}
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
              href={
                process.env.NEXT_PUBLIC_STARKNET_ID + "/pdfs/PrivacyPolicy.pdf"
              }
              target="_blank"
              rel="noreferrer"
            >
              policies
            </a>
          </p>
        </div>
        {!isArOnforced ? (
          <div
            className="flex items-center justify-left text-xs cursor-pointer"
            onClick={onChangeRenewalBox}
          >
            <Checkbox checked={renewalBox} sx={{ padding: 0 }} />
            <p className="ml-2 text-left">
              Enable subscription and don&apos;t pay gas for your yearly renewal
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RegisterCheckboxes;
