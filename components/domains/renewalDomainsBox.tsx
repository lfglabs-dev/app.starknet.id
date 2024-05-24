import React, { FunctionComponent, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import DomainCheckboxes from "@/components/domains/domainCheckboxes";
import { fullIdsToDomains } from "@/utils/subscriptionService";

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
  const [ownedDomains, setOwnedDomains] = useState<string[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_LINK}/addr_to_full_ids?addr=${address}`
      )
        .then((response) => response.json())
        .then((data) => {
          const ownedDomainsToSet: string[] = fullIdsToDomains(data.full_ids);
          setOwnedDomains(ownedDomainsToSet);
          setSelectedDomains(
            ownedDomainsToSet.reduce((acc, domain) => {
              acc[domain] = true; // Initially set all to true. Adjust as needed.
              return acc;
            }, {} as Record<string, boolean>)
          );
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [address, setSelectedDomains]);

  return (
    <DomainCheckboxes
      setSelectedDomains={setSelectedDomains}
      domains={ownedDomains}
      isLoading={isLoading}
      selectedDomains={selectedDomains}
      helperText={helperText}
    />
  );
};

export default RenewalDomainsBox;
