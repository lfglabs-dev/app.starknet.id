import { useContractRead } from "@starknet-react/core";
import { useNftPpVerifierContract } from "./contracts";
import { Abi } from "starknet";
import { useEffect, useState } from "react";
import { filterAssets, retrieveAssets } from "@/utils/nftService";

export default function useWhitelistedNFTs(address: string) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [whitelistedContracts, setWhitelistedContracts] = useState<bigint[]>(
    []
  );
  const [userNfts, setUserNfts] = useState<StarkscanNftProps[]>([]);
  const { contract } = useNftPpVerifierContract();
  const { data: whitelistData, error: whitelistError } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "get_whitelisted_contracts",
    args: [],
    watch: false,
  });

  useEffect(() => {
    if (whitelistError || !whitelistData) {
      setWhitelistedContracts([]);
    } else {
      setWhitelistedContracts(whitelistData as bigint[]);
    }
  }, [whitelistData, whitelistError]);

  useEffect(() => {
    if (!address || !whitelistedContracts) {
      return;
    }
    retrieveAssets(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/starkscan/fetch_nfts`,
      address
    )
      .then((data) => {
        setUserNfts(filterAssets(data.data, whitelistedContracts));
        setIsLoading(false);
      })
      .catch(() => {
        setUserNfts([]);
        setIsLoading(false);
      });
  }, [whitelistedContracts, address]);

  return { userNfts, isLoading };
}
