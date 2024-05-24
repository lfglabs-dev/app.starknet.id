import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV2.module.css";
import { Checkbox, Skeleton, Tooltip } from "@mui/material";
import InfoIcon from "../UI/iconsComponents/icons/infoIcon";

type DomainCheckboxes = {
  helperText: string;
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
    <div className="flex flex-col flex-wrap gap-4 justify-start items-start">
      <div className="flex">
        <Tooltip
          className="cursor-pointer mr-1"
          title={helperText}
          placement="top"
        >
          <div>
            <InfoIcon width="20px" color={"#454545"} />
          </div>
        </Tooltip>
        <p className={styles.legend}>Domain(s) to renew</p>
      </div>
      <div className={styles.renewalBox}>
        {domains.length === 0 ? (
          <p className={styles.legend}>{noDomainText}</p>
        ) : (
          domains.map((domain) => (
            <div key={domain} className="flex items-center gap-1">
              <p className={styles.domainsToRenew}>{domain}</p>
              <Checkbox
                checked={Boolean(selectedDomains?.[domain])}
                onChange={() => handleCheckboxChange(domain)}
                sx={{ padding: 0 }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DomainCheckboxes;
