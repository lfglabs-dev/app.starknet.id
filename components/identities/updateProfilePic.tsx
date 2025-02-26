import React, { FunctionComponent, useState } from "react";
import ModalProfilePic from "../UI/modalProfilePic";
import profilepicstyles from "@/styles/components/profilePic.module.css";
import styles from "@/styles/pfpcollections.module.css";
import PfpGallery from "./pfpGallery";
import useWhitelistedNFTs from "@/hooks/useWhitelistedNFTs";
import { useAccount } from "@starknet-react/core";
import Button from "@/components/UI/button";
import Step from "../domains/steps/step";
import PfpNftCard from "../pfpcollections/pfpNftCard";
import { NftCollections, ourNfts } from "@/utils/constants";

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
  const [tab, setTab] = useState(0);

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

  const hasNoNfts = userNfts.length === 0;

  const stepsData = [
    {
      icon: (
        <img
          src={
            tab === 0
              ? "/icons/AvatarIcon-active.svg"
              : "/icons/AvatarIcon-inactive.svg"
          }
          alt="Your NFTs"
        />
      ),
      label: "Your NFTs",
    },
    {
      icon: (
        <img
          src={
            tab === 1
              ? "/icons/ecosystem-active.svg"
              : "/icons/ecosystem-inactive.svg"
          }
          alt="Starknet ID Ecosystem"
        />
      ),
      label: "Starknet ID Ecosystem",
    },
    {
      icon: (
        <img
          src={
            tab === 2
              ? "/icons/starknet-active.svg"
              : "/icons/starknet-inactive.svg"
          }
          alt="Overall Starknet Ecosystem"
        />
      ),
      label: "Overall Starknet Ecosystem",
    },
  ];

  return (
    <>


      <div className="w-full flex flex-col xl:flex-row justify-center gap-4 px-3 py-4 lg:px-32 md:px-16 sm:py-12 xl:h-[88vh]">
        <aside className={styles.purchaseStepNav} role="navigation">
          <div>
            {stepsData.map((step, index) => (
              <Step
                key={index}
                stepIndex={index}
                currentStep={tab}
                setStep={setTab}
                icon={step.icon}
                label={step.label}
                showDoneIcon={false}
                allowSwitchAnytime={true}
              />
            ))}
          </div>
          <img
          src="/visuals/purchaseStepVisual.svg"
          alt="Domain purchase steps visualization"
        />
        </aside>

        <div className={styles.purchaseStepNavMobile}  role="navigation">
          
          {stepsData.map((step, index) => (
            <Step
              key={index}
              stepIndex={index}
              currentStep={tab}
              setStep={setTab}
              icon={step.icon}
              label={step.label}
              showDoneIcon={false}
              allowSwitchAnytime={true}
            />
          ))}
             <div className="flex justify-center">
          <img
            src="/visuals/purchaseStepVisualMobile.svg"
            alt="Domain purchase steps visualization"
          />

        </div>
        </div>

        <div className="flex-1">
          {tab === 0 && (
            <section>
              <div className={profilepicstyles.container}>
                <div
                  className={` ${hasNoNfts ? styles.noNfts : styles.gallery}`}
                >
                  <PfpGallery
                    selectPfp={selectPfp}
                    selectedPfp={selectedPfp}
                    userNfts={userNfts}
                    isLoading={isLoading}
                    title="Choose your NFT Profile picture"
                  />
                  {userNfts.length > 0 && 
                  <>
                    <div className="flex justify-center">
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
              </div>
            </section>
          )}
          {tab === 1 && (
            <section>
              <div className={styles.nfts}>
                {ourNfts.map((collection, index) => (
                  <PfpNftCard
                    key={index}
                    image={collection.imageUri}
                    name={collection.name}
                    onClick={() => window.open(collection.infoPage)}
                  />
                ))}
              </div>
            </section>
          )}
          {tab === 2 && (
            <section>
              <div className={styles.nfts}>
                {NftCollections.map((collection, index) => (
                  <PfpNftCard
                    key={index}
                    image={collection.imageUri}
                    name={collection.name}
                    onClick={() => window.open(collection.externalLink)}
                  />
                ))}
              </div>
            </section>
          )}
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
