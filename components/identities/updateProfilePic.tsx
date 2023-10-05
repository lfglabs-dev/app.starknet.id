import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import ArrowLeftIcon from "../UI/iconsComponents/icons/arrowLeftIcon";
import theme from "../../styles/theme";
import { hexToDecimal } from "../../utils/feltService";
import NftCard from "../UI/nftCard";
import ModalProfilePic from "../UI/modalProfilePic";
import { filterAssets, retrieveAssets } from "../../utils/nftService";

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
  const whitelistedContracts: string[] = [
    hexToDecimal(process.env.NEXT_PUBLIC_STARKNETID_CONTRACT),
    hexToDecimal(process.env.NEXT_PUBLIC_NFT_SQ_CONTRACT),
  ];

  useEffect(() => {
    if (!identity?.addr) return;
    retrieveAssets(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/starkscan/fetch_nfts`,
      identity.addr
    ).then((data) => {
      const filteredAssets = filterAssets(data.data, whitelistedContracts);
      setUserNft(filteredAssets);
    });
  }, [tokenId, identity]);

  const selectPicture = (nft: StarkscanNftProps) => {
    setOpenModal(true);
    setSelectedPic(nft);
  };

  const goBack = () => {
    setOpenModal(false);
    openTxModal();
    back();
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.arrows} onClick={() => back()}>
          <ArrowLeftIcon width="24" color={theme.palette.secondary.main} />
          <p>Back</p>
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
