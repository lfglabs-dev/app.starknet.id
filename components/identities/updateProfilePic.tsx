import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import PfpGallery from "./pfpGallery";
import SelectedCollections from "./selectedCollections";
import useWhitelistedNFTs from "@/hooks/useWhitelistedNFTs";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import Button from "../UI/button";
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
  const { userNfts, isLoading } =  useWhitelistedNFTs(address as string);
  const [selectedPfp, setSelectedPfp] = useState<StarkscanNftProps | null>(null);
  const [callData, setCallData] = useState<Call[]>([]);
  const { addTransaction } = useNotificationManager();
  const { sendAsync: execute, data: updateData } = useSendTransaction({
    calls: callData,
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateData]);

  const hasNoNfts = userNfts.length === 0;

  return (
    <div className={styles.container}>
      <div className={` ${hasNoNfts ? styles.noNfts : styles.gallery}`}>
        <PfpGallery
          selectPfp={setSelectedPfp}
          selectedPfp={selectedPfp}
          userNfts={userNfts}
          isLoading={isLoading}
          title="Our Suggestions"
        />
      </div>

      {!isLoading && (
        <div className={styles.pfpBtns}>
          <Button onClick={() => selectedPfp && execute()} disabled={!selectedPfp}>
            Confirm profile picture
          </Button>
          <div className={styles.pfpCancel} onClick={back}>
            <p>Cancel</p>
          </div>
        </div>
      )}

      {!hasNoNfts && (
        <div className={styles.gallery}>
          <SelectedCollections />
        </div>
      )}
    </div>
  );
};

export default UpdateProfilePic;
