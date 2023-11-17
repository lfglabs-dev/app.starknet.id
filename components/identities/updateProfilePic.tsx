import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import NftCard from "../UI/nftCard";
import ModalProfilePic from "../UI/modalProfilePic";
import {
  filterAssets,
  getWhitelistedPfpContracts,
  retrieveAssets,
} from "../../utils/nftService";
import BackButton from "../UI/backButton";
import PfpSkeleton from "./skeletons/pfpSkeleton";
import SelectedCollections from "./selectedCollections";
import { debounce } from "../../utils/debounceService";

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
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [selectedPic, setSelectedPic] = useState<StarkscanNftProps | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const whitelistedContracts: string[] = useMemo(() => {
    return getWhitelistedPfpContracts();
  }, []);

  useEffect(() => {
    if (!identity?.owner_addr) return;
    retrieveAssets(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/starkscan/fetch_nfts`,
      identity.owner_addr
    ).then((data) => {
      const filteredAssets = filterAssets(data.data, whitelistedContracts);
      setUserNft(filteredAssets);
      setIsLoading(false);
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

  const handleMouseEnter = debounce((id: string) => setIsHovered(id), 50);
  const handleMouseLeave = debounce(() => setIsHovered(null), 50);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.arrows}>
          <BackButton onClick={() => back()} />
        </div>
        <div className={styles.gallery}>
          <p className={styles.subtitle}>Your NFTs</p>
          <h2 className={styles.title}>Choose your NFT Profile picture</h2>
          <div className={styles.nftSection}>
            {isLoading ? (
              <PfpSkeleton />
            ) : userNft && userNft.length > 0 ? (
              userNft.map((nft, index) => {
                if (!nft.image_url) return null;
                return (
                  <div
                    key={index}
                    onMouseEnter={() => handleMouseEnter(nft.token_id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <NftCard
                      image={nft.image_url as string}
                      name={nft.name as string}
                      selectPicture={() => selectPicture(nft)}
                      isHovered={isHovered === nft.token_id}
                    />
                  </div>
                );
              })
            ) : (
              <p className={styles.message}>
                You don&apos;t own any whitelisted NFTs yet.{" "}
              </p>
            )}
          </div>
          <div>
            {userNft && userNft.length > 0 ? (
              <div className={styles.selectedCollections}>
                <p className={styles.subtitle}>Get a new Profile Pic</p>
                <h2 className={styles.title}>Our NFT Collections selection</h2>
              </div>
            ) : null}
            <SelectedCollections />
          </div>
        </div>
      </div>
      <ModalProfilePic
        isModalOpen={openModal}
        closeModal={goBack}
        nftData={selectedPic as StarkscanNftProps}
        tokenId={tokenId}
        setPfpTxHash={setPfpTxHash}
      />
    </>
  );
};

export default UpdateProfilePic;
