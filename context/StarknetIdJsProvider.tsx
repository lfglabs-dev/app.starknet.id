import React, { FunctionComponent } from "react";
import { createContext, useMemo } from "react";
import { Provider, constants } from "starknet";
import { StarknetIdNavigator } from "starknetid.js";

type StarknetIdJsConfig = {
  starknetIdNavigator: StarknetIdNavigator | null;
};

export const StarknetIdJsContext = createContext<StarknetIdJsConfig>({
  starknetIdNavigator: null,
});

export const StarknetIdJsProvider: FunctionComponent<Context> = ({
  children,
}) => {
  const starknetIdNavigator = useMemo(() => {
    return new StarknetIdNavigator(
      new Provider({
        sequencer: {
          network:
            process.env.NEXT_PUBLIC_IS_TESTNET === "true"
              ? constants.NetworkName.SN_GOERLI
              : constants.NetworkName.SN_MAIN,
        },
      }),
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? constants.StarknetChainId.SN_GOERLI
        : constants.StarknetChainId.SN_MAIN
    );
  }, []);

  const contextValues = useMemo(() => {
    return {
      starknetIdNavigator,
    };
  }, [starknetIdNavigator]);

  return (
    <StarknetIdJsContext.Provider value={contextValues}>
      {children}
    </StarknetIdJsContext.Provider>
  );
};
