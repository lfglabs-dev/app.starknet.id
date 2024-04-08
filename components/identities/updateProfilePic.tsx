import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import ModalProfilePic from "../UI/modalProfilePic";
import BackButton from "../UI/backButton";
import SelectedCollections from "./selectedCollections";
import PfpGallery from "./pfpGallery";

type UpdateProfilePicProps = {
  tokenId: string;
  back: () => void;
  openTxModal: () => void;
  setPfpTxHash: (hash: string) => void;
};

const UpdateProfilePic: FunctionComponent<UpdateProfilePicProps> = ({
  tokenId,
  back,
  openTxModal,
  setPfpTxHash,
}) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedPfp, setSelectedPfp] = useState<StarkscanNftProps | null>(
    null
  );

  const selectPfp = (nft: StarkscanNftProps) => {
    setOpenModal(true);
    setSelectedPfp(nft);
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
          <PfpGallery selectPfp={selectPfp} selectedPfp={selectedPfp} />
        </div>
        <div className={styles.gallery}>
          <p className={styles.subtitle}>Get a new Profile Pic</p>
          <h2 className={styles.title}>Our NFT Collections selection</h2>
          <SelectedCollections />
        </div>
      </div>
      <ModalProfilePic
        isModalOpen={openModal}
        closeModal={goBack}
        nftData={selectedPfp as StarkscanNftProps}
        tokenId={tokenId}
        setPfpTxHash={setPfpTxHash}
      />
    </>
  );
};

export default UpdateProfilePic;
