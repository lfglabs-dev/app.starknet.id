import { useContext } from "react";
import { StarknetIdJsContext } from "../context/StarknetIdJsProvider";

export const useStarknetIdJs = () => {
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  return {
    starknetIdNavigator,
  };
};
