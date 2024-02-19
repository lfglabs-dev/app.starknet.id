import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { createContext, useMemo } from "react";
import { Provider, constants } from "starknet";
import { StarknetIdNavigator } from "starknetid.js";
import { hexToDecimal } from "../utils/feltService";
import { getImgUrl } from "../utils/stringService";
import { getStarknet } from "get-starknet-core";
import { WebWalletConnector } from "starknetkit/webwallet";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { Connector } from "starknetkit";
import { InjectedConnector } from "starknetkit/injected";

type StarknetIdJsConfig = {
  starknetIdNavigator: StarknetIdNavigator | null;
  provider: Provider | null;
  identitiesTemp: FullId[];
  updateIdentityImg: (id: string, imgUrl: string) => void;
  getPfp: (id: string) => string;
  availableConnectors: Connector[];
};

export const StarknetIdJsContext = createContext<StarknetIdJsConfig>({
  starknetIdNavigator: null,
  provider: null,
  identitiesTemp: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateIdentityImg: () => {},
  getPfp: () => "",
  availableConnectors: [],
});

export const StarknetIdJsProvider: FunctionComponent<Context> = ({
  children,
}) => {
  const { address } = useAccount();
  const [identitiesTemp, setIdentities] = useState<FullId[]>([]);
  const [hasOKX, setHasOKX] = useState<boolean>(false);

  const isTestnet = useMemo(() => {
    return process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? true : false;
  }, []);

  const provider = useMemo(() => {
    return new Provider({
      rpc: {
        nodeUrl: `https://starknet-${
          isTestnet ? "goerli" : "mainnet"
        }.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      },
    });
  }, []);

  const starknetIdNavigator = useMemo(() => {
    return new StarknetIdNavigator(
      provider,
      isTestnet
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

  // Check if OKX wallet is injected in the user browser, if so we'll add it in the list of connectors
  // To remove once discovery links for OKX are added in get-starknet-core lib
  useMemo(() => {
    if (isTestnet) {
      setHasOKX(false);
      return;
    }
    const wallets = getStarknet();
    wallets.getAvailableWallets().then((wallets) => {
      if (wallets.filter((wallet) => wallet.name.includes("OKX")).length > 0) {
        setHasOKX(true);
      } else {
        setHasOKX(false);
      }
    });
  }, [isTestnet]);

  const availableConnectors = useMemo(() => {
    return [
      new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
      new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
      ...(hasOKX
        ? [new InjectedConnector({ options: { id: "okxwallet", name: "OKX" } })]
        : []),
      new WebWalletConnector({
        url: isTestnet
          ? "https://web.hydrogen.argent47.net"
          : "https://web.argent.xyz/",
      }),
      new ArgentMobileConnector({
        dappName: "Starknet ID",
        url: process.env.NEXT_PUBLIC_APP_LINK as string,
        chainId: constants.NetworkName.SN_MAIN,
        icons: ["https://app.starknet.id/visuals/StarknetIdLogo.svg"],
      }),
    ];
  }, [hasOKX]);

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
      availableConnectors,
    };
  }, [
    starknetIdNavigator,
    provider,
    identitiesTemp,
    updateIdentityImg,
    availableConnectors,
  ]);

  return (
    <StarknetIdJsContext.Provider value={contextValues}>
      {children}
    </StarknetIdJsContext.Provider>
  );
};
