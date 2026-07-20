import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import DomainCheckboxes from "@/components/domains/domainCheckboxes";

type RenewalDomainsBoxProps = {
  domains: string[];
  loading: boolean;
  selectedDomains: Record<string, boolean>;
  setSelectedDomains: Dispatch<SetStateAction<Record<string, boolean>>>;
};

const RenewalDomainsBox: FunctionComponent<RenewalDomainsBoxProps> = ({
  domains,
  loading,
  selectedDomains,
  setSelectedDomains,
}) => (
  <DomainCheckboxes
    setSelectedDomains={setSelectedDomains}
    domains={domains}
    isLoading={loading}
    selectedDomains={selectedDomains}
  />
);

export default RenewalDomainsBox;
