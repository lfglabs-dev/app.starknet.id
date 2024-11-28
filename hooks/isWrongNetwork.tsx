import { mainnet } from "@starknet-react/chains";
import { bigintToStringHex } from "@/utils/stringService";
import { sepolia } from "@starknet-react/chains";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useEffect, useState } from "react";

const useIsWrongNetwork = () => {
  const { chain } = useNetwork();
  const { account } = useAccount();
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);

  useEffect(() => {
    if (!account) {
      setIsWrongNetwork(false);
      return;
    }

    setIsWrongNetwork(
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? bigintToStringHex(chain.id) === bigintToStringHex(mainnet.id)
        : bigintToStringHex(chain.id) === bigintToStringHex(sepolia.id)
    );
  }, [account, chain]);

  return {
    isWrongNetwork,
    setIsWrongNetwork,
  };
};

export default useIsWrongNetwork;
