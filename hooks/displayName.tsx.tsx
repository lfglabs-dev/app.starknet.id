import { minifyAddress, minifyDomain } from "../utils/stringService";
import { useDomainFromAddress } from "./naming";

export function useDisplayName(address: string | undefined): string {
  const domain = useDomainFromAddress(address);
  const displayName = domain
    ? minifyDomain(domain)
    : address
    ? minifyAddress(address)
    : "none";

  return displayName;
}
