import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import style from "../../styles/components/registerV3.module.css";
import ModalProfilePic from "../UI/modalProfilePic";
import BackButton from "../UI/backButton";
import SelectedCollections from "./selectedCollections";
import PfpGallery from "./pfpGallery";
import useWhitelistedNFTs from "@/hooks/useWhitelistedNFTs";
import { useAccount } from "@starknet-react/core";
import RegisterSteps from "../domains/steps/registerSteps";

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
  const { address } = useAccount();
  const { userNfts, isLoading } = useWhitelistedNFTs(address as string);
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
        
        <aside className={`${style.yournftStepNav}`} role="navigation">
          {/* <RegisterSteps
            currentStep={currentStep}
            setStep={goToStep}
            showPfp={userNfts && userNfts.length > 0}
            isLoading={isLoadingNfts}
          /> */}
        <div className="px-3 py-2">
          <div className={`${styles.sideBar} mb-4`}>
            <img src="/icons/AvatarIcon.png" alt="Img" />
            <p> Your NFT</p>
          </div>
          <div className={`${styles.sideBar} mb-4 text-gray-300`}>
            <img src="/icons/Vector.png" alt="Img" />
            <p> Starknet ID Ecosystem</p>
          </div>
          <div className={`${styles.sideBar} text-gray-300`}>
            <img src="/icons/StarknetIDIcon.png" alt="Img" />
            <p> Overall Starknet Ecosystem</p>
          </div>
        </div>
        

          <img
            className="w-full"
            src="/visuals/purchaseStepVisual.svg"
            alt="Domain purchase steps visualization"
          />
        </aside>
        <div className="bg-white flex flex-col items-center">
          <div className={styles.gallery}>
            <PfpGallery
              selectPfp={selectPfp}
              selectedPfp={selectedPfp}
              userNfts={userNfts}
              isLoading={isLoading}
            />
          </div>

          <div className={`hidden justify-center my-4 bg-white ${userNfts && "flex"}`}>
            <button 
              className={styles.chooseButton}
            >
              Choose Profile Picture
            </button>
          </div>
          
          <div className={`hidden justify-center my-4 bg-white ${userNfts && "flex"}`}>
            <button 
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>

        </div>
        <div className="hidden">
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
