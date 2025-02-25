import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import ModalProfilePic from "../UI/modalProfilePic";
import SelectedCollections from "./selectedCollections";
import PfpGallery from "./pfpGallery";
import useWhitelistedNFTs from "@/hooks/useWhitelistedNFTs";
import { useAccount } from "@starknet-react/core";
import Button from "@/components/UI/button";

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

  const selectPfp = (nft: StarkscanNftProps | null) => {
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

  const hasNoNfts = userNfts.length === 1;

  return (
    <>
      <div className={styles.container}>
        <div className={` ${hasNoNfts ? styles.noNfts : styles.gallery}`}>
          <PfpGallery
            selectPfp={selectPfp}
            selectedPfp={selectedPfp}
            userNfts={userNfts}
            isLoading={isLoading}
            title="Choose your NFT Profile picture"
          />
          {true && 
              <>
                <div className="flex justify-center mt-1">
                  <Button 
                    onClick={() => selectPfp(selectedPfp)} 
                    disabled={selectedPfp === null}
                  >
                    CONFIRM PROFILE PICTURE
                  </Button>
                </div>
                <div className="flex justify-center">
                  <button 
                    className={styles.btnWrapperCancelBtn}
                    onClick={back}
                  >
                    CANCEL
                  </button>
                </div>
              </>  
          }

        </div>
        {!hasNoNfts && (
          <div className={styles.gallery}>
            <SelectedCollections />
          </div>
        )}
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
