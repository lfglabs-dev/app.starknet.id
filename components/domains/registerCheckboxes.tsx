import React, { FunctionComponent } from "react";
import { Checkbox } from "@mui/material";

type RegisterCheckboxes = {
  onChangeTermsBox: () => void;
  onChangeRenewalBox?: () => void;
  termsBox: boolean;
  renewalBox?: boolean;
};

const RegisterCheckboxes: FunctionComponent<RegisterCheckboxes> = ({
  onChangeRenewalBox,
  onChangeTermsBox,
  termsBox,
  renewalBox,
}) => {
  return (
    <div className="w-full mb-3">
      <div className="flex mt-2 flex-col sm:flex-row">
        <div
          className="flex items-center justify-left text-xs mr-2 cursor-pointer"
          onClick={onChangeTermsBox}
        >
          <Checkbox checked={termsBox} sx={{ padding: 0 }} />
          <p className="ml-2">
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
        <div
          className="flex items-center justify-left text-xs cursor-pointer"
          onClick={onChangeRenewalBox}
        >
          <Checkbox checked={renewalBox} sx={{ padding: 0 }} />
          <p className="ml-1">
            Enable auto-renewal and don&apos;t pay gas for your yearly renewal
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterCheckboxes;
