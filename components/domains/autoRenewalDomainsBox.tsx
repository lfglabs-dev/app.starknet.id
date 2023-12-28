import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/registerV2.module.css";
import { Checkbox, Skeleton, Tooltip } from "@mui/material";
import InfoIcon from "../UI/iconsComponents/icons/infoIcon";
import { hexToDecimal } from "../../utils/feltService";
import { useAccount } from "@starknet-react/core";

type AutoRenewalDomainsBoxProps = {
  helperText: string;
  setSelectedDomains: React.Dispatch<
    React.SetStateAction<Record<string, boolean> | undefined>
  >;
  selectedDomains?: Record<string, boolean>;
};

const AutoRenewalDomainsBox: FunctionComponent<AutoRenewalDomainsBoxProps> = ({
  helperText,
  setSelectedDomains,
  selectedDomains,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [ownedDomains, setOwnedDomains] = useState<string[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/renewal/get_non_subscribed_domains?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          setOwnedDomains(data);
          setSelectedDomains(
            data.reduce((acc: { [key: string]: boolean }, domain: string) => {
              acc[domain] = true; // Initially set all to true. Adjust as needed.
              return acc;
            }, {})
          );
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [address, setSelectedDomains]);

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
        {ownedDomains.length === 0 ? (
          <p className={styles.legend}>
            You don&apos;t have any domain to renew or you&apos;re not connected
            to your wallet
          </p>
        ) : (
          ownedDomains.map((domain: string, index) => (
            <div key={index} className="flex items-center gap-1">
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

export default AutoRenewalDomainsBox;
