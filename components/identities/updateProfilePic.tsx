import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import { hexToDecimal } from "../../utils/feltService";
import NftCard from "../UI/nftCard";
import ModalProfilePic from "../UI/modalProfilePic";
import { filterAssets, retrieveAssets } from "../../utils/nftService";
import BackButton from "../UI/backButton";
import {
  PFP_WL_CONTRACTS_MAINNET,
  PFP_WL_CONTRACTS_TESTNET,
} from "../../utils/constants";

type UpdateProfilePicProps = {
  identity?: Identity;
  tokenId: string;
  back: () => void;
  openTxModal: () => void;
  setPfpTxHash: (hash: string) => void;
};

const UpdateProfilePic: FunctionComponent<UpdateProfilePicProps> = ({
  tokenId,
  identity,
  back,
  openTxModal,
  setPfpTxHash,
}) => {
  const [userNft, setUserNft] = useState<StarkscanNftProps[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedPic, setSelectedPic] = useState<StarkscanNftProps | null>(
    null
  );
  const whitelistedContracts: string[] =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true"
      ? PFP_WL_CONTRACTS_TESTNET.map((hex) => hexToDecimal(hex))
      : PFP_WL_CONTRACTS_MAINNET.map((hex) => hexToDecimal(hex));

  console.log("whitelistedContracts", whitelistedContracts);

  useEffect(() => {
    if (!identity?.addr) return;
    retrieveAssets(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/starkscan/fetch_nfts`,
      identity.addr
    ).then((data) => {
      console.log("data", data);
      const filteredAssets = filterAssets(data.data, whitelistedContracts);
      console.log("filteredAssets", filteredAssets);
      setUserNft(filteredAssets);
    });
  }, [tokenId, identity]);

  const selectPicture = (nft: StarkscanNftProps) => {
    setOpenModal(true);
    setSelectedPic(nft);
  };

  const goBack = (cancel: boolean) => {
    setOpenModal(false);
    if (!cancel) {
      openTxModal();
      back();
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.arrows}>
          <BackButton onClick={() => back()} />
        </div>
        <div className={styles.gallery}>
          <p className={styles.subtitle}>Your NFTs</p>
          <h2 className={styles.title}>Choose your nft identity</h2>
          <div className={styles.nftSection}>
            {userNft && userNft.length > 0 ? (
              userNft.map((nft, index) => {
                if (!nft.image_url) return null;
                return (
                  <NftCard
                    key={index}
                    image={nft.image_url as string}
                    name={nft.name as string}
                    selectPicture={() => selectPicture(nft)}
                  />
                );
              })
            ) : (
              <p>You don&apos;t own any whitelisted NFTs yet. </p>
            )}
          </div>
        </div>
      </div>
      <ModalProfilePic
        open={openModal}
        closeModal={goBack}
        nft={selectedPic as StarkscanNftProps}
        id={tokenId}
        setPfpTxHash={setPfpTxHash}
      />
    </>
  );
};

export default UpdateProfilePic;
