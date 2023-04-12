import { useEffect, useState } from "react";
import { minifyAddress, minifyDomain } from "../utils/stringService";
// import { useDomainFromAddress } from "./naming";
import { useStarknetIdJs } from "./useStarknetIdJs";
// import { Provider } from "starknet";
// import { useStarkName } from "@starknet-react/core";

export function useDisplayName(address: string): string {
  const { starknetIdNavigator } = useStarknetIdJs();
  const [domainOrAddress, setDomainOrAddress] = useState<string>("none");
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
  // const domain = useDomainFromAddress(address);
  // if (!starknetIdNavigator) return minifyAddress(address);
  // const domain = await starknetIdNavigator?.getStarkName(address);
  // .then((domain: string) => {
  //   console.log("domain returned", domain);
  //   return domain
  //     ? minifyDomain(domain)
  //     : address
  //     ? minifyAddress(address)
  //     : "none";
  // })
  // .catch((err) => {
  //   console.log("err", err);
  //   return address ? minifyAddress(address) : "none";
  // });

  useEffect(() => {
    if (!address) return;
    const fetchStarkName = async () => {
      const domain = await starknetIdNavigator
        ?.getStarkName(address)
        .then((domain) => {
          return domain;
        })
        .catch(() => {
          return null;
        });
      setDomainOrAddress(
        domain
          ? minifyDomain(domain)
          : address
          ? minifyAddress(address)
          : "none"
      );
    };
    fetchStarkName();
  }, [starknetIdNavigator, address]);

  return domainOrAddress;

  // const toDisplay = domain
  //   ? minifyDomain(domain)
  //   : address
  //   ? minifyAddress(address)
  //   : "none";

  // return toDisplay;
}
