import { Modal, TextField } from "@mui/material";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@/hooks/useContract";
import React, { FunctionComponent, useEffect, useState } from "react";
import { isHexString, minifyAddress } from "../../utils/stringService";
import styles from "../../styles/components/modalMessage.module.css";
import Button from "../UI/button";
import { hexToDecimal } from "../../utils/feltService";
import ConfirmationTx from "../UI/confirmationTx";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../utils/constants";
import { utils } from "starknetid.js";
import { Call } from "starknet";
import SolanaCalls from "../../utils/callData/solanaCalls";

type ChangeAddressModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  domain?: string;
  currentTargetAddress?: string;
};

const ChangeAddressModal: FunctionComponent<ChangeAddressModalProps> = ({
  handleClose,
  isModalOpen,
  domain,
  currentTargetAddress = "0",
}) => {
  const { address } = useAccount();
  const [targetAddress, setTargetAddress] = useState<string>("");
  const { addTransaction } = useNotificationManager();
  const [isTxSent, setIsTxSent] = useState(false);
  const [callData, setCallData] = useState<Call[]>([]);
  const { writeAsync: setResolving, data: resolvingData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    setCallData([
      SolanaCalls.setResolving(
        utils.encodeDomain(domain)[0].toString(),
        hexToDecimal(targetAddress)
      ),
    ]);
  }, [domain, address, targetAddress]);

  useEffect(() => {
    if (!resolvingData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `Target address updated for ${domain}.sol.stark`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.CHANGE_ADDRESS,
        hash: resolvingData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvingData]); // We want to execute this only once when the tx is sent

  function setDomainToAddress(): void {
    setResolving();
  }

  function changeAddress(value: string): void {
    isHexString(value) ? setTargetAddress(value) : null;
  }

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <>
        {isTxSent ? (
          <ConfirmationTx
            closeModal={handleClose}
            txHash={resolvingData?.transaction_hash}
          />
        ) : (
          <div className={styles.menu}>
            <button className={styles.menu_close} onClick={handleClose}>
              <svg viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <p className={styles.menu_title}>
              Change the target address of {domain}.sol.stark
            </p>
            <div className="mt-5 flex flex-col justify-center">
              {currentTargetAddress && (
                <p>
                  A stark domain resolves to a Starknet address, the current
                  target address of {domain} is{" "}
                  <strong>{minifyAddress(currentTargetAddress)}</strong>. You
                  can change it by using this form.
                </p>
              )}
              <div className="mt-5">
                <TextField
                  helperText="You need to copy paste a wallet address or it won't work"
                  fullWidth
                  label="new target address"
                  id="outlined-basic"
                  value={targetAddress ?? address}
                  variant="outlined"
                  onChange={(e) => changeAddress(e.target.value)}
                  color="secondary"
                  required
                />
              </div>
              <div className="mt-5 flex justify-center">
                <Button
                  disabled={!targetAddress}
                  onClick={() => setDomainToAddress()}
                >
                  Set new address
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    </Modal>
  );
};

export default ChangeAddressModal;
