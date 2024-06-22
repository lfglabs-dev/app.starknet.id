import React, { FunctionComponent } from "react";
import { Checkbox } from "@mui/material";
import InputHelper from "../UI/inputHelper";
import { weiToEth } from "../../utils/feltService";
import { CurrencyType } from "@/utils/constants";
import TermCheckbox from "./termCheckbox";

type RegisterCheckboxes = {
  termsBox: boolean;
  renewalBox?: boolean;
  onChangeTermsBox: () => void;
  onChangeRenewalBox?: () => void;
  variant?: "default" | "white";
  isArOnforced?: boolean;
  showMainDomainBox?: boolean;
  onChangeMainDomainBox?: () => void;
  mainDomainBox?: boolean;
  domain?: string;
  displayedCurrency?: CurrencyType;
  maxPriceRange?: string;
};

const RegisterCheckboxes: FunctionComponent<RegisterCheckboxes> = ({
  onChangeRenewalBox,
  onChangeTermsBox,
  termsBox,
  renewalBox,
  variant = "default",
  isArOnforced,
  mainDomainBox,
  onChangeMainDomainBox,
  showMainDomainBox = false,
  domain,
  displayedCurrency = CurrencyType.ETH,
  maxPriceRange,
}) => {
  const getHelperText = (): string => {
    return `Enabling a subscription permits Starknet ID to renew your domain automatically every year for you! This approval gives us only the possibility to renew your domain once per year ${
      maxPriceRange
        ? `(maximum ${Number(weiToEth(maxPriceRange)).toFixed(
            3
          )} ${displayedCurrency}/year)`
        : ""
    } and we'll cover the transaction fee for you!`;
  };
  return (
    <div className="w-full mb-3">
      <div className="flex flex-col gap-3">
        {showMainDomainBox ? (
          <div className="flex items-center justify-left text-xs">
            <Checkbox
              checked={mainDomainBox}
              sx={{ padding: 0 }}
              onClick={onChangeMainDomainBox}
            />
            <p
              className="ml-2 mr-10 text-left flex items-center gap-2 relative cursor-pointer"
              onClick={onChangeMainDomainBox}
            >
              Set {domain ?? ""} as your main domain
            </p>
          </div>
        ) : null}
        {!isArOnforced ? (
          <InputHelper helperText={getHelperText()}>
            <div
              className="flex items-center justify-left text-xs cursor-pointer"
              onClick={onChangeRenewalBox}
            >
              <Checkbox checked={renewalBox} sx={{ padding: 0 }} />
              <p className="ml-2 mr-10 text-left flex items-center gap-2 relative">
                Enable subscription and don&apos;t pay gas for your yearly
                renewal
              </p>
            </div>
          </InputHelper>
        ) : null}
        <TermCheckbox
          checked={termsBox}
          onChange={onChangeTermsBox}
          variant={variant}
        />
      </div>
    </div>
  );
};

export default RegisterCheckboxes;
