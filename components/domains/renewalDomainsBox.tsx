import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/registerV2.module.css";
import { Checkbox, Skeleton, Tooltip } from "@mui/material";
import InfoIcon from "../UI/iconsComponents/icons/infoIcon";
import { isStarkRootDomain } from "../../utils/stringService";
import { useAccount } from "@starknet-react/core";

type RenewalDomainsBoxProps = {
  helperText: string;
  setSelectedDomains: React.Dispatch<
    React.SetStateAction<Record<string, boolean> | undefined>
  >;
  selectedDomains?: Record<string, boolean>;
};

const RenewalDomainsBox: FunctionComponent<RenewalDomainsBoxProps> = ({
  helperText,
  setSelectedDomains,
  selectedDomains,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [ownedDomains, setOwnedDomains] = useState<FullId[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_full_ids?addr=${address}`
      )
        .then((response) => response.json())
        .then((data) => {
          const ownedDomainsToSet: FullId[] = data.full_ids.filter(
            (identity: FullId) => isStarkRootDomain(identity?.domain)
          );
          setOwnedDomains(ownedDomainsToSet);
          setSelectedDomains(
            ownedDomainsToSet.reduce((acc, identity) => {
              acc[identity.domain] = true; // Initially set all to true. Adjust as needed.
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
          ownedDomains.map((identity: FullId, index) => (
            <div key={index} className="flex items-center gap-1">
              <p className={styles.domainsToRenew}>{identity.domain}</p>
              <Checkbox
                checked={Boolean(selectedDomains?.[identity.domain])}
                onChange={() => handleCheckboxChange(identity.domain)}
                sx={{ padding: 0 }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RenewalDomainsBox;
