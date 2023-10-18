import { useContext, useEffect, useState } from "react";
import { StarknetIdJsContext } from "../context/StarknetIdJsProvider";
import { decimalToHex, fromUint256 } from "../utils/feltService";

export default function useProfilePicture(tokenId: string) {
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [image, setImage] = useState<string>();

  useEffect(() => {
    if (!tokenId) return;

    const getVerifierData = async () => {
      const data = await starknetIdNavigator?.getPpVerifierData(
        tokenId,
        process.env.NEXT_PUBLIC_NFT_PP_VERIFIER
      );
      console.log("data", data);
      if (data && data.some((value) => value !== BigInt(0))) {
        console.log("has values");
        const nftId = fromUint256(data[2], data[3]);
        console.log("nftId", nftId);

        const nft = await fetch(
          `https://${
            process.env.NEXT_PUBLIC_IS_TESTNET === "true"
              ? "api-testnet"
              : "api"
          }.starkscan.co/api/v0/nft/${decimalToHex(
            data[1].toString(10)
          )}/${nftId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.NEXT_PUBLIC_STARKSCAN}`,
            },
          }
        ).then((res) => res.json());
        if (nft.image_url) setImage(nft.image_url);
        else
          setImage(
            `${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${tokenId}`
          );
      } else {
        console.log("has no values");
        setImage(
          `${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${tokenId}`
        );
      }
    };
    getVerifierData();
  }, [tokenId]);

  return image;
}
