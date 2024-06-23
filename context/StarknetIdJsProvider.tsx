import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useState } from "react";
import { createContext, useMemo } from "react";
import { Provider } from "starknet";
import { StarknetIdNavigator } from "starknetid.js";
import { hexToDecimal } from "../utils/feltService";
import { mainnet, sepolia } from "@starknet-react/chains";
import { bigintToStringHex } from "@/utils/stringService";

type StarknetIdJsConfig = {
  starknetIdNavigator: StarknetIdNavigator | null;
  provider: Provider | null;
  identitiesTemp: FullId[];
};

export const StarknetIdJsContext = createContext<StarknetIdJsConfig>({
  starknetIdNavigator: null,
  provider: null,
  identitiesTemp: [],
});

export const StarknetIdJsProvider: FunctionComponent<Context> = ({
  children,
}) => {
  const { address } = useAccount();
  const [identitiesTemp, setIdentities] = useState<FullId[]>([]);

  const isTestnet = useMemo(() => {
    return process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? true : false;
  }, []);

  const provider = useMemo(() => {
    return new Provider({
      nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
    });
  }, []);

  const starknetIdNavigator = useMemo(() => {
    return new StarknetIdNavigator(
      provider,
      (isTestnet
        ? bigintToStringHex(sepolia.id)
        : bigintToStringHex(mainnet.id)) as
        | "0x534e5f4d41494e"
        | "0x534e5f5345504f4c4941"
    );
  }, [provider, isTestnet]);

  useMemo(() => {
    if (!address) return;
    fetch(
      `${
        process.env.NEXT_PUBLIC_SERVER_LINK
      }/addr_to_full_ids?addr=${hexToDecimal(address)}`
    )
      .then((response) => response.json())
      .then((data) => {
        setIdentities(data.full_ids);
      });
  }, [address]);

  const contextValues = useMemo(() => {
    return {
      starknetIdNavigator,
      provider,
      identitiesTemp,
    };
  }, [starknetIdNavigator, provider, identitiesTemp]);

  return (
    <StarknetIdJsContext.Provider value={contextValues}>
      {children}
    </StarknetIdJsContext.Provider>
  );
};
