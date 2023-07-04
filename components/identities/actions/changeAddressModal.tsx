import { Modal, TextField } from "@mui/material";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { isHexString } from "../../../utils/stringService";
import styles from "../../../styles/components/modalMessage.module.css";
import Button from "../../UI/button";
import { hexToDecimal, decimalToHex } from "../../../utils/feltService";
import { posthog } from "posthog-js";
import ConfirmationTx from "../../UI/confirmationTx";

type ChangeAddressModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  domain?: string;
  currentTargetAddress?: string;
};

const ChangeAddressModal: FunctionComponent<ChangeAddressModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  domain,
  currentTargetAddress = "0",
}) => {
  const { address } = useAccount();
  const [targetAddress, setTargetAddress] = useState<string>("");
  const { addTransaction } = useTransactionManager();
  const [isTxSent, setIsTxSent] = useState(false);

  //set_domain_to_address execute
  const set_domain_to_address_calls = {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_domain_to_address",
    calldata: [...callDataEncodedDomain, hexToDecimal(targetAddress)],
  };

  const { writeAsync: set_domain_to_address, data: domainToAddressData } =
    useContractWrite({
      calls: set_domain_to_address_calls,
    });

  useEffect(() => {
    if (!domainToAddressData?.transaction_hash) return;
    posthog?.capture("changeAddress");
    addTransaction({ hash: domainToAddressData?.transaction_hash ?? "" });
    setIsTxSent(true);
  }, [domainToAddressData]);

  function setDomainToAddress(): void {
    set_domain_to_address();
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
            txHash={domainToAddressData?.transaction_hash}
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
              Change the target address of {domain}
            </p>
            <div className="mt-5 flex flex-col justify-center">
              {currentTargetAddress && (
                <p className="break-all">
                  <strong>Current Address :</strong>&nbsp;
                  <span>{decimalToHex(currentTargetAddress)}</span>
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
