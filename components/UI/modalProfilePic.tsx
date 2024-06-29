import React, { useEffect, useState } from "react";
import styles from "../../styles/components/modalMessage.module.css";
import ppStyles from "../../styles/components/profilePic.module.css";
import { FunctionComponent } from "react";
import { Modal } from "@mui/material";
import ClickableAction from "./iconsComponents/clickableAction";
import theme from "../../styles/theme";
import DoneFilledIcon from "./iconsComponents/icons/doneFilledIcon";
import ArrowLeftIcon from "./iconsComponents/icons/arrowLeftIcon";
import { useContractWrite } from "@starknet-react/core";
import { Call } from "starknet";
import identityChangeCalls from "../../utils/callData/identityChangeCalls";
import { hexToDecimal, toUint256 } from "../../utils/feltService";
import { getImgUrl } from "../../utils/stringService";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../utils/constants";

type ModalProfilePicProps = {
  closeModal: (cancel: boolean) => void;
  isModalOpen: boolean;
  nftData: StarkscanNftProps;
  tokenId: string;
  setPfpTxHash: (hash: string) => void;
  back: () => void;
};

const ModalProfilePic: FunctionComponent<ModalProfilePicProps> = ({
  closeModal,
  setPfpTxHash,
  isModalOpen,
  nftData,
  tokenId,
  back,
}) => {
  const [callData, setCallData] = useState<Call[]>([]);
  const { addTransaction } = useNotificationManager();
  const { writeAsync: execute, data: updateData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    if (!nftData) return;
    const nft_id = toUint256(nftData.token_id);
    setCallData([
      identityChangeCalls.updateProfilePicture(
        hexToDecimal(nftData.contract_address),
        nft_id.low,
        nft_id.high,
        tokenId
      ),
    ]);
  }, [nftData, tokenId]);

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
    closeModal(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateData]); // We want to trigger this only when the tx passed

  const handleConfirm = () => {
    execute();
    closeModal(false);
    back();
  };

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={styles.menu}>
        <button className={styles.menu_close} onClick={() => closeModal(true)}>
          <svg viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <p className={ppStyles.modalTitle}>Do you want to add this NFT?</p>
        {nftData?.image_url ? (
          <div className={`${ppStyles.nftImg} mx-auto my-5`}>
            <img
              src={getImgUrl(nftData.image_url)}
              alt={`Image of ${nftData.name}`}
            />
          </div>
        ) : null}
        <div className={ppStyles.modalActions}>
          <ClickableAction
            title="Yes, confirm the modification"
            style="primary"
            icon={
              <DoneFilledIcon
                width="30"
                color="#FFFFFF"
                secondColor={theme.palette.primary.main}
              />
            }
            description=""
            onClick={handleConfirm}
          />
          <div className={ppStyles.modalBack} onClick={() => closeModal(true)}>
            <ArrowLeftIcon width="24" color={theme.palette.secondary.main} />
            <p>No, Cancel</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ModalProfilePic;
