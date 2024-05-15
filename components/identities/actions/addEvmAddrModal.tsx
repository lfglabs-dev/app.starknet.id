import { Modal, TextField } from "@mui/material";
import { useContractWrite } from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { isHexString } from "../../../utils/stringService";
import styles from "../../../styles/components/evmModalMessage.module.css";
import Button from "../../UI/button";
import { hexToDecimal } from "../../../utils/feltService";
import ConfirmationTx from "../../UI/confirmationTx";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";
import { Identity } from "../../../utils/apiWrappers/identity";
import identityChangeCalls from "../../../utils/callData/identityChangeCalls";
import { shortString } from "starknet";

type AddEvmAddrModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  identity?: Identity;
};

const AddEvmAddrModal: FunctionComponent<AddEvmAddrModalProps> = ({
  handleClose,
  isModalOpen,
  identity,
}) => {
  const [evmAddress, setEvmAddress] = useState<string | undefined>(
    identity?.getUserDataWithField("evm-address")
  );
  const [fieldInput, setFieldInput] = useState<string>(evmAddress ?? "");
  const { addTransaction } = useNotificationManager();
  const [isTxSent, setIsTxSent] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const { writeAsync: set_user_data, data: userData } = useContractWrite({
    calls:
      identity && isValid
        ? [
            identityChangeCalls.setUserData(
              identity.id,
              shortString.encodeShortString("evm-address"),
              hexToDecimal(evmAddress)
            ),
          ]
        : [],
  });

  useEffect(() => {
    if (!userData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `EVM addressed updated for ${identity?.domain}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.SET_USER_DATA,
        hash: userData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]); // We want to execute this only once when the tx is sent

  function setUserData(): void {
    set_user_data();
  }

  function changeAddress(value: string): void {
    setFieldInput(value);
    isValidAddress(value);
  }

  function isValidAddress(addressOrName: string): void {
    if (addressOrName.endsWith(".eth")) {
      // we fetch the address from ENS
      fetch(`https://enstate.rs/n/${addressOrName}`)
        .then((res) => {
          res.json().then((data) => {
            console.log(data);
            if (data.address) {
              setEvmAddress(data.address);
              setMessage(`Resolving to ${data.address}`);
              setIsValid(true);
            } else {
              setEvmAddress(undefined);
              setMessage("Invalid ENS name");
              setIsValid(false);
            }
          });
        })
        .catch(() => {
          setEvmAddress(undefined);
          setIsValid(false);
          setMessage("ENS name not found");
        });
    } else {
      if (isHexString(addressOrName)) {
        setEvmAddress(addressOrName);
        setIsValid(true);
        setMessage(undefined);
      } else {
        setEvmAddress(undefined);
        setIsValid(false);
        setMessage("Invalid address");
      }
    }
  }

  function closeModal(): void {
    setIsTxSent(false);
    handleClose();
  }

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <>
        {isTxSent ? (
          <ConfirmationTx
            closeModal={closeModal}
            txHash={userData?.transaction_hash}
          />
        ) : (
          <div className={styles.menu}>
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
            <p className={styles.menu_subtitle}>Add a EVM address for</p>
            <p className={styles.menu_title}>{identity?.domain}</p>
            <div className="mt-5 flex flex-col justify-center">
              <div className="mt-5">
                <TextField
                  helperText={
                    message ?? "Add your EVM address or your ENS name"
                  }
                  fullWidth
                  label="new address"
                  id="outlined-basic"
                  value={fieldInput ?? ""}
                  variant="outlined"
                  onChange={(e) => changeAddress(e.target.value)}
                  color="secondary"
                  required
                  error={!isValid}
                />
              </div>
              <div className="mt-5 flex justify-center">
                <div>
                  <Button
                    disabled={!evmAddress || !isValid}
                    onClick={() => setUserData()}
                  >
                    Set EVM address
                  </Button>
                </div>
              </div>
              <div className={styles.infoCard}>
                <div>
                  <h3 className={styles.cardTitle}>
                    Why Add an EVM Address to Your Starknet Domain?
                  </h3>
                  <p className={styles.cardDesc}>
                    By adding an EVM address to your Starknet domain, you
                    enhance its functionality and connectivity. Your Starknet
                    domain automatically comes with an associated ENS subdomain,
                    simplifying ENS management. Configure your EVM address in
                    your preferred wallet for seamless integration.
                  </p>
                </div>
                <img
                  src="/visuals/ecosystemMap.webp"
                  className={styles.cardImg}
                />
              </div>
            </div>
          </div>
        )}
      </>
    </Modal>
  );
};

export default AddEvmAddrModal;
