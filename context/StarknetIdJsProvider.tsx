import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { createContext, useMemo } from "react";
import { Provider, constants } from "starknet";
import { StarknetIdNavigator } from "starknetid.js";
import { hexToDecimal } from "../utils/feltService";
import { getImgUrl } from "../utils/stringService";

type StarknetIdJsConfig = {
  starknetIdNavigator: StarknetIdNavigator | null;
  provider: Provider | null;
  identitiesTemp: FullId[];
  updateIdentityImg: (id: string, imgUrl: string) => void;
  getPfp: (id: string) => string;
};

export const StarknetIdJsContext = createContext<StarknetIdJsConfig>({
  starknetIdNavigator: null,
  provider: null,
  identitiesTemp: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateIdentityImg: () => {},
  getPfp: () => "",
});

export const StarknetIdJsProvider: FunctionComponent<Context> = ({
  children,
}) => {
  const { address } = useAccount();
  const [identitiesTemp, setIdentities] = useState<FullId[]>([]);

  const provider = useMemo(() => {
    return new Provider({
      sequencer: {
        network:
          process.env.NEXT_PUBLIC_IS_TESTNET === "true"
            ? constants.NetworkName.SN_GOERLI
            : constants.NetworkName.SN_MAIN,
      },
    });
  }, []);

  const starknetIdNavigator = useMemo(() => {
    return new StarknetIdNavigator(
      provider,
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? constants.StarknetChainId.SN_GOERLI
        : constants.StarknetChainId.SN_MAIN
    );
  }, [provider]);

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

  const updateIdentityImg = useCallback((id: string, imgUrl: string) => {
    setIdentities((prev) => {
      return prev.map((identity) =>
        identity.id === id ? { ...identity, pp_url: imgUrl } : identity
      );
    });
  }, []);

  const contextValues = useMemo(() => {
    const getPfp = (id: string): string => {
      const identity = identitiesTemp.filter(
        (identity) => identity.id === id
      )[0];
      if (identity && identity.pp_url) return getImgUrl(identity.pp_url);
      else return `${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${id}`;
    };

    return {
      starknetIdNavigator,
      provider,
      identitiesTemp,
      updateIdentityImg,
      getPfp,
    };
  }, [starknetIdNavigator, provider, identitiesTemp, updateIdentityImg]);

  return (
    <StarknetIdJsContext.Provider value={contextValues}>
      {children}
    </StarknetIdJsContext.Provider>
  );
};
