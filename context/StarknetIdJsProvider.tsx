import React, { FunctionComponent } from "react";
import { createContext, useMemo } from "react";
import { Provider, constants } from "starknet";
import { StarknetIdNavigator } from "starknetid.js";

type StarknetIdJsConfig = {
  starknetIdNavigator: StarknetIdNavigator | null;
  provider: Provider | null;
};

export const StarknetIdJsContext = createContext<StarknetIdJsConfig>({
  starknetIdNavigator: null,
  provider: null,
});

export const StarknetIdJsProvider: FunctionComponent<Context> = ({
  children,
}) => {
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

  const contextValues = useMemo(() => {
    return {
      starknetIdNavigator,
      provider,
    };
  }, [starknetIdNavigator, provider]);

  return (
    <StarknetIdJsContext.Provider value={contextValues}>
      {children}
    </StarknetIdJsContext.Provider>
  );
};
