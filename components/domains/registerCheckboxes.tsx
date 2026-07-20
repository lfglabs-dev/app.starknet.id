import type { FunctionComponent } from "react";
import { Checkbox } from "@mui/material";
import TermCheckbox from "@/components/domains/termCheckbox";

type RegisterCheckboxesProps = {
  termsBox: boolean;
  onChangeTermsBox: () => void;
  showMainDomainBox?: boolean;
  mainDomainBox?: boolean;
  onChangeMainDomainBox?: () => void;
  domain?: string;
};

const RegisterCheckboxes: FunctionComponent<RegisterCheckboxesProps> = ({
  onChangeTermsBox,
  termsBox,
  showMainDomainBox = false,
  mainDomainBox = false,
  onChangeMainDomainBox,
  domain,
}) => (
  <div className="w-full mb-3">
    <div className="flex flex-col gap-3">
      {showMainDomainBox ? (
        <div className="flex items-center justify-left text-xs">
          <Checkbox checked={mainDomainBox} sx={{ padding: 0 }} onClick={onChangeMainDomainBox} />
          <p className="ml-2 mr-10 text-left flex items-center gap-2 relative cursor-pointer" onClick={onChangeMainDomainBox}>
            Set {domain ?? ""} as your main domain
          </p>
        </div>
      ) : null}
      <TermCheckbox checked={termsBox} onChange={onChangeTermsBox} />
    </div>
  </div>
);

export default RegisterCheckboxes;
