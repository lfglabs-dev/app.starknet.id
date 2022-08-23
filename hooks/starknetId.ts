import { useContract } from "@starknet-react/core";
import starknet_id_abi from "../abi/starknet_id_abi.json";

export function useStarknetIdContract() {
  return useContract({
    abi: starknet_id_abi,
    address:
      "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b",
  });
}
