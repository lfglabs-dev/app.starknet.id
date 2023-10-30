import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/components/modalMessage.module.css";
import ppStyles from "../../styles/components/profilePic.module.css";
import { FunctionComponent } from "react";
import { Modal } from "@mui/material";
import ClickableAction from "./iconsComponents/clickableAction";
import theme from "../../styles/theme";
import DoneFilledIcon from "./iconsComponents/icons/doneFilledIcon";
import ArrowLeftIcon from "./iconsComponents/icons/arrowLeftIcon";
import { useContractWrite, useTransactionManager } from "@starknet-react/core";
import { Call } from "starknet";
import identityChangeCalls from "../../utils/callData/identityChangeCalls";
import { hexToDecimal } from "../../utils/feltService";
import { getImgUrl } from "../../utils/stringService";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";

type ModalProfilePicProps = {
  closeModal: (cancel: boolean) => void;
  isModalOpen: boolean;
  nftData: StarkscanNftProps;
  tokenId: string;
  setPfpTxHash: (hash: string) => void;
};

const ModalProfilePic: FunctionComponent<ModalProfilePicProps> = ({
  closeModal,
  setPfpTxHash,
  isModalOpen,
  nftData,
  tokenId,
}) => {
  const [callData, setCallData] = useState<Call[]>([]);
  const { addTransaction } = useTransactionManager();
  const { writeAsync: execute, data: updateData } = useContractWrite({
    calls: callData,
  });
  const { updateIdentityImg } = useContext(StarknetIdJsContext);

  useEffect(() => {
    if (!nftData) return;
    const nft_id = nftData.token_id;
    setCallData([
      identityChangeCalls.updateProfilePicture(
        hexToDecimal(nftData.contract_address),
        nft_id,
        tokenId
      ),
    ]);
  }, [nftData, tokenId]);

  useEffect(() => {
    if (!updateData?.transaction_hash) return;
    addTransaction({ hash: updateData.transaction_hash });
    setPfpTxHash(updateData.transaction_hash);
    updateIdentityImg(tokenId, nftData.image_url as string);
    closeModal(false);
  }, [updateData]);

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
            onClick={() => execute()}
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
