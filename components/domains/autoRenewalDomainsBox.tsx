import React, { FunctionComponent, useEffect, useState } from "react";
import { getNonSubscribedDomains } from "@/utils/subscriptionService";
import DomainCheckboxes from "@/components/domains/domainCheckboxes";

type AutoRenewalDomainsBoxProps = {
  helperText: string;
  setSelectedDomains: React.Dispatch<
    React.SetStateAction<Record<string, boolean> | undefined>
  >;
  isLoading: boolean;
  selectedDomains?: Record<string, boolean>;
  needSubscription?: NeedSubscription;
};

const AutoRenewalDomainsBox: FunctionComponent<AutoRenewalDomainsBoxProps> = ({
  helperText,
  setSelectedDomains,
  selectedDomains,
  needSubscription,
  isLoading,
}) => {
  const [nonSubscribedDomains, setNonSubscribedDomains] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (!needSubscription) return;
    const nonSubscribedDomains = getNonSubscribedDomains(needSubscription);
    setNonSubscribedDomains(nonSubscribedDomains);
    // Initially set all checkboxes to true
    setSelectedDomains(
      Object.fromEntries(nonSubscribedDomains.map((domain) => [domain, true]))
    );
  }, [needSubscription, setSelectedDomains]);

  return (
    <DomainCheckboxes
      setSelectedDomains={setSelectedDomains}
      domains={nonSubscribedDomains}
      isLoading={isLoading}
      selectedDomains={selectedDomains}
      helperText={helperText}
      noDomainText="You don't have any domain to subscribe or you're not connected to your wallet"
    />
  );
};

export default AutoRenewalDomainsBox;
