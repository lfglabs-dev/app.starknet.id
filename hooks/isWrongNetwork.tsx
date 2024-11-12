import { mainnet } from "@starknet-react/chains";
import { bigintToStringHex } from "@/utils/stringService";
import { sepolia } from "@starknet-react/chains";
import { useNetwork } from "@starknet-react/core";
import { useEffect, useState } from "react";

const useIsWrongNetwork = () => {
  const { chain } = useNetwork();
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);

  useEffect(() => {
    setIsWrongNetwork(
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? bigintToStringHex(chain.id) === bigintToStringHex(mainnet.id)
        : bigintToStringHex(chain.id) === bigintToStringHex(sepolia.id)
    );
  }, [chain]);

  return {
    isWrongNetwork,
    setIsWrongNetwork,
  };
};

export default useIsWrongNetwork;
