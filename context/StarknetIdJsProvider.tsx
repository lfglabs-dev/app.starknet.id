import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useState } from "react";
import { createContext, useMemo } from "react";
import { Provider, constants } from "starknet";
import { StarknetIdNavigator } from "starknetid.js";
import { hexToDecimal } from "../utils/feltService";
import { getStarknet } from "get-starknet-core";
import { WebWalletConnector } from "starknetkit/webwallet";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { Connector } from "starknetkit";
import { InjectedConnector } from "starknetkit/injected";

type StarknetIdJsConfig = {
  starknetIdNavigator: StarknetIdNavigator | null;
  provider: Provider | null;
  identitiesTemp: FullId[];
  availableConnectors: Connector[];
};

export const StarknetIdJsContext = createContext<StarknetIdJsConfig>({
  starknetIdNavigator: null,
  provider: null,
  identitiesTemp: [],
  availableConnectors: [],
});

export const StarknetIdJsProvider: FunctionComponent<Context> = ({
  children,
}) => {
  const { address } = useAccount();
  const [identitiesTemp, setIdentities] = useState<FullId[]>([]);
  const [hasOKX, setHasOKX] = useState<boolean>(false);
  const [hasBitget, setHasBitget] = useState<boolean>(false);

  const isTestnet = useMemo(() => {
    return process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? true : false;
  }, []);

  const provider = useMemo(() => {
    return new Provider({
      rpc: {
        nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
      },
    });
  }, []);

  const starknetIdNavigator = useMemo(() => {
    return new StarknetIdNavigator(
      provider,
      isTestnet
        ? constants.StarknetChainId.SN_SEPOLIA
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

  // Check if OKX wallet is injected in the user browser, if so we'll add it in the list of connectors
  // To remove once discovery links for OKX are added in get-starknet-core lib
  useMemo(() => {
    if (isTestnet) {
      setHasOKX(false);
      setHasBitget(false);
      return;
    }
    const wallets = getStarknet();
    wallets.getAvailableWallets().then((wallets) => {
      if (wallets.filter((wallet) => wallet.id.includes("okx")).length > 0) {
        setHasOKX(true);
      } else {
        setHasOKX(false);
      }
      if (wallets.filter((wallet) => wallet.id === "bitkeep").length > 0) {
        setHasBitget(true);
      } else {
        setHasBitget(false);
      }
    });
  }, [isTestnet]);

  const availableConnectors = useMemo(() => {
    return [
      new InjectedConnector({ options: { id: "braavos" } }),
      new InjectedConnector({ options: { id: "argentX" } }),
      // ...(hasOKX
      // ? [
      new InjectedConnector({ options: { id: "okxwallet" } }),
      new InjectedConnector({ options: { id: "bitkeep" } }),
      // ]
      // : []),
      // ...(hasBitget
      //   ? [
      //       new InjectedConnector({
      //         options: { id: "bitkeep" },
      //       }),
      //     ]
      //   : []),
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
  }, [hasOKX, hasBitget]);

  const contextValues = useMemo(() => {
    return {
      starknetIdNavigator,
      provider,
      identitiesTemp,
      availableConnectors,
    };
  }, [starknetIdNavigator, provider, identitiesTemp, availableConnectors]);

  return (
    <StarknetIdJsContext.Provider value={contextValues}>
      {children}
    </StarknetIdJsContext.Provider>
  );
};
