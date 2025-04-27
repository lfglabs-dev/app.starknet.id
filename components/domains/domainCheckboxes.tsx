import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV2.module.css";
import { Checkbox, Skeleton } from "@mui/material";
import CustomCheckmarkIcon from "../UI/iconsComponents/icons/customCheckMark";

type DomainCheckboxes = {
  helperText?: string;
  setSelectedDomains: React.Dispatch<
    React.SetStateAction<Record<string, boolean> | undefined>
  >;
  isLoading: boolean;
  domains: string[];
  selectedDomains?: Record<string, boolean>;
  noDomainText?: string;
};

const DomainCheckboxes: FunctionComponent<DomainCheckboxes> = ({
  helperText,
  setSelectedDomains,
  selectedDomains,
  isLoading,
  domains,
  noDomainText = "You don't have any domain to renew or you're not connected to your wallet",
}) => {
  const handleCheckboxChange = (domain: string) => {
    setSelectedDomains((prevState) => ({
      ...prevState,
      [domain]: !prevState?.[domain],
    }));
  };

  return isLoading ? (
    <Skeleton variant="rectangular" width="100%" height="80px" />
  ) : (
    <div className="flex w-full flex-col flex-wrap gap-[8px] justify-start items-start">
      <div className="flex">
        <p className={styles.legend}>Domain(s) to renew</p>
      </div>
      <div className={styles.renewalBox} >
        {domains.length === 0 ? (
          <p className={styles.legend}>{noDomainText}</p>
        ) : (
          domains.map((domain) => (
            <div key={domain} className="flex items-center gap-2">
              <Checkbox
                checked={Boolean(selectedDomains?.[domain])}
                onChange={() => handleCheckboxChange(domain)}
                sx={{ padding: 0 }}
                checkedIcon={ < CustomCheckmarkIcon /> }
              />
              <p className={styles.domainsToRenew}>{domain}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DomainCheckboxes;
