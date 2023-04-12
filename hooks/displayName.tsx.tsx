import { minifyAddress, minifyDomain } from "../utils/stringService";
import { useDomainFromAddress } from "./naming";
// import { Provider } from "starknet";
// import { useStarkName } from "@starknet-react/core";

export function useDisplayName(address: string): string {
  // // With starknet.js
  // const provider = new Provider({
  //   sequencer: {
  //     network:
  //       process.env.NEXT_PUBLIC_IS_TESTNET === "true"
  //         ? "goerli-alpha"
  //         : "mainnet-alpha",
  //   },
  // });

  // const toDisplay = await provider
  //   .getStarkName(address)
  //   .catch(() => minifyAddress(address))
  //   .then((domain) => {
  //     return minifyDomain(domain);
  //   });

  // // With starknet-react
  // const { data: domain } = useStarkName({ address });
  // const toDisplay = domain
  //   ? minifyDomain(domain)
  //   : address
  //   ? minifyAddress(address)
  //   : "none";

  // With our own hook
  const { domain } = useDomainFromAddress(address);
  const toDisplay = domain
    ? minifyDomain(domain)
    : address
    ? minifyAddress(address)
    : "none";

  return toDisplay;
}
