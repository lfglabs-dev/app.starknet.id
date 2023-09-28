import React, { useEffect, useState } from "react";
import styles from "../../styles/components/modalMessage.module.css";
import ppStyles from "../../styles/components/profilePic.module.css";
import { FunctionComponent } from "react";
import { Modal } from "@mui/material";
import ClickableAction from "./iconsComponents/clickableAction";
import theme from "../../styles/theme";
import DoneFilledIcon from "./iconsComponents/icons/doneFilledIcon";
import ArrowLeftIcon from "./iconsComponents/icons/arrowLeftIcon";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import { Call } from "starknet";
import registerCalls from "../../utils/registerCalls";

type ModalProfilePicProps = {
  closeModal: () => void;
  open: boolean;
  nft: StarkscanNftProps;
  id: string;
};

const ModalProfilePic: FunctionComponent<ModalProfilePicProps> = ({
  closeModal,
  open,
  nft,
  id,
}) => {
  const { address } = useAccount();
  const [callData, setCallData] = useState<Call[]>([]);
  const { addTransaction } = useTransactionManager();
  const { writeAsync: execute, data: updateData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    if (!nft) return;
    const nft_id = nft.token_id;
    setCallData([
      registerCalls.updateProfilePicture(nft.contract_address, nft_id, id),
    ]);
  }, [nft, id]);

  useEffect(() => {
    if (!updateData?.transaction_hash) return;

    // todo: add tx, close modal, goback to profile & show notification on approved tx
    // addTransaction({ hash: registerData.transaction_hash });
    // setIsTxModalOpen(true);
  }, [updateData]);

  return (
    <Modal
      disableAutoFocus
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={styles.menu}>
        <img
          src="/leaves/new/leavesGroup03.svg"
          className={ppStyles.leavesLeft}
        />
        <img
          src="/leaves/new/leavesGroup04.svg"
          className={ppStyles.leavesRight}
        />
        <button className={styles.menu_close} onClick={closeModal}>
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
        {nft?.image_url ? (
          <div className={ppStyles.nftImg}>
            <img
              src={
                nft.image_url.startsWith("ipfs://")
                  ? nft.image_url.replace(
                      "ipfs://",
                      "https://gateway.pinata.cloud/ipfs/"
                    )
                  : nft.image_url
              }
              alt={`Image of ${nft.name}`}
            />
          </div>
        ) : null}
        <div className="mx-auto z-1">
          <ClickableAction
            title="Yes, confirm the modification"
            style="primary"
            icon={
              <DoneFilledIcon
                width="30"
                filled={theme.palette.primary.main}
                color="#FFFFFF"
              />
            }
            description=""
            onClick={() => execute()}
          />
          <div className={ppStyles.modalBack} onClick={closeModal}>
            <ArrowLeftIcon width="24" color={theme.palette.secondary.main} />
            <p>No, Cancel</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ModalProfilePic;
