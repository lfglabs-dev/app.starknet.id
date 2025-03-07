import React, { FunctionComponent, useState, useEffect } from "react";
import profilepicstyles from "../../styles/components/profilePic.module.css";
import styles from "@/styles/pfpcollections.module.css";
import PfpGallery from "./pfpGallery";
import useWhitelistedNFTs from "@/hooks/useWhitelistedNFTs";
import Button from "@/components/UI/button";
import Step from "../domains/steps/step";
import PfpNftCard from "../pfpcollections/pfpNftCard";
import { NftCollections, ourNfts } from "@/utils/constants";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { Call } from "starknet";
import identityChangeCalls from "../../utils/callData/identityChangeCalls";
import { hexToDecimal, toUint256 } from "../../utils/feltService";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../utils/constants";

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
  const [selectedPfp, setSelectedPfp] = useState<StarkscanNftProps | null>(
    null
  );
  const [tab, setTab] = useState(0);
  const [callData, setCallData] = useState<Call[]>([]);
  const { addTransaction } = useNotificationManager();
  const { sendAsync: execute, data: updateData } = useSendTransaction({
    calls: callData,
  });

  const selectPfp = (nft: StarkscanNftProps | null) => {
      setSelectedPfp(nft);
    };


  useEffect(() => {
    if (!selectedPfp) return;
    const nft_id = toUint256(selectedPfp.token_id);
    setCallData([
      identityChangeCalls.updateProfilePicture(
        hexToDecimal(selectedPfp.contract_address),
        nft_id.low,
        nft_id.high,
        tokenId
      ),
    ]);
  }, [selectedPfp, tokenId]);

  useEffect(() => {
    if (!updateData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `For identity ${tokenId}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.SET_PFP,
        hash: updateData.transaction_hash,
        status: "pending",
      },
    });
    setPfpTxHash(updateData.transaction_hash);
    openTxModal();
    back();
  }, [updateData, addTransaction, back, openTxModal, setPfpTxHash, tokenId]);

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

        <div className={styles.purchaseStepNavMobile} role="navigation">

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
                  className={` ${hasNoNfts ? profilepicstyles.noNfts : profilepicstyles.gallery}`}
                >
                  <PfpGallery
                    selectPfp={selectPfp}
                    selectedPfp={selectedPfp}
                    userNfts={userNfts}
                    isLoading={isLoading}
                    title="Choose your NFT Profile picture"
                  />
                </div>
                {!isLoading && !hasNoNfts&& (
                  <div className={profilepicstyles.pfpBtns}>
                    {!isLoading && (
                      <Button onClick={() => selectedPfp && execute()} disabled={!selectedPfp}>
                        Confirm profile picture
                      </Button>
                    )}
                    {!isLoading && (
                      <div className={profilepicstyles.pfpCancel} onClick={back}>
                        <p>Cancel</p>
                      </div>
                    )}
                  </div>
                )}
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
    </>
  );
};


export default UpdateProfilePic;

