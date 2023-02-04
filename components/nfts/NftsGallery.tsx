import React, { FunctionComponent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/components/nftsGallerey.module.css";
import { minifyDomain } from "../../utils/stringService";
import VerifiedIcon from "../UI/iconsComponents/icons/verifiedIcon";
import Button from "../UI/button";
import {
  useAccount,
  useStarknetExecute,
  useTransactionReceipt,
} from "@starknet-react/core";

type NftsGalleryProps = {
  identities: FullId[];
};

const NftsGallery: FunctionComponent<NftsGalleryProps> = ({ identities }) => {
  const router = useRouter();
  const [nftSelected, setNftSelected] = useState<number>(-1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { account } = useAccount();

  //move to env
  const [whitelistedContracts, setWhitelistedContracts] = useState<string[]>([
    "0x00a8bc225d01a9bebecd4be0e59bd60878b8fd87214314abd9fa809ca24e01a7",
    "0x0541b5dd5fae206ceccaf4eeb0642e4c04d456c5bc296eab047c9414bdad4f09",
    "0x04047810e4f759336f941a16b6de9d8d2f934e976b9a9431a2964646df9025c6",
  ]);

  useEffect(() => {
    async function fetchNft(contractAddress) {
      let res = await fetch(
        `https://api.aspect.co/api/v0/assets?contract_address=${contractAddress}&owner_address=${"0x072D4F3FA4661228ed0c9872007fc7e12a581E000FAd7b8f3e3e5bF9E6133207"}`
      );
      return await res.json();
    }
    async function fetchNfts() {
      let promises = [];
      whitelistedContracts.map((address) => {
        promises.push(fetchNft(address));
      });
      const result = await Promise.all(promises);
      console.log("Results - ", result);
      const imageUris: string[] = [];
      result.map((nfts) => {
        nfts.assets.map((nft) => {
          imageUris.push(nft.image_url_copy);
        });
      });
      setImageUrls(imageUris);
    }
    fetchNfts();
  }, []);

  return (
    // Our Indexer
    <>
      <div className={styles.nftContainer}>
        {imageUrls.map((url, index) => (
          <div key={index} onClick={() => setNftSelected(index)}>
            <div className={styles.nftImageContainer}>
              <img width={150} height={150} src={url} alt="avatar" />
              {(index == nftSelected || true) && (
                <VerifiedIcon
                  style={{
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: "-20px",
                    transition: "100ms linear",
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  color="var(--green)"
                  width={nftSelected == index ? "20px" : "0px"}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <Button
        disabled={nftSelected == -1}
        onClick={() => router.push("/")}
        style={{
          width: "35%",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "5%",
        }}
      >
        Select
      </Button>
    </>
  );
};

export default NftsGallery;
