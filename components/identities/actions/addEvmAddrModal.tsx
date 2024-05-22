import {
  CircularProgress,
  InputAdornment,
  Modal,
  TextField,
} from "@mui/material";
import { useContractWrite } from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import styles from "../../../styles/components/evmModalMessage.module.css";
import Button from "../../UI/button";
import { hexToDecimal } from "../../../utils/feltService";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";
import { Identity } from "../../../utils/apiWrappers/identity";
import identityChangeCalls from "../../../utils/callData/identityChangeCalls";
import { shortString } from "starknet";
import { isValidEns } from "@/utils/ensService";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { getDomainWithoutStark } from "@/utils/stringService";

type AddEvmAddrModalProps = {
  handleClose: (showNotif: boolean) => void;
  isModalOpen: boolean;
  identity?: Identity;
};

const AddEvmAddrModal: FunctionComponent<AddEvmAddrModalProps> = ({
  handleClose,
  isModalOpen,
  identity,
}) => {
  const router = useRouter();
  const [evmAddress, setEvmAddress] = useState<string | undefined>(
    identity?.evmAddress
  );
  const [fieldInput, setFieldInput] = useState<string>(evmAddress ?? "");
  const { addTransaction } = useNotificationManager();
  const [isValid, setIsValid] = useState(true);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isSendingTx, setIsSendingTx] = useState(false);

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
    // redirect to confirmation page
    router.push(
      `/evmConfirmation?domain=${getDomainWithoutStark(
        identity?.domain
      )}&tokenId=${identity?.id}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]); // We want to execute this only once when the tx is sent

  async function setUserData(): Promise<void> {
    try {
      setIsSendingTx(true);
      await set_user_data();
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to set user data:", error);
    }
  }

  function changeAddress(value: string): void {
    setFieldInput(value);
    isValidAddrOrName(value);
  }

  function isValidAddrOrName(addressOrName: string): void {
    setLoading(true);

    // Cancel the previous request if it's still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for the new request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (isValidEns(addressOrName)) {
      fetch(`https://enstate.rs/n/${addressOrName}`, {
        signal: abortController.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.address) {
            setEvmAddress(data.address);
            setMessage(`Resolving to ${data.address}`);
            setIsValid(true);
          } else {
            setEvmAddress(undefined);
            setMessage("Invalid ENS name");
            setIsValid(false);
          }
          setLoading(false);
        })
        .catch((error) => {
          // Request was aborted
          if (error.name === "AbortError") return;
          setEvmAddress(undefined);
          setIsValid(false);
          setMessage("Invalid address or ENS");
          setLoading(false);
        });
    } else if (ethers.isAddress(addressOrName)) {
      setEvmAddress(addressOrName);
      setIsValid(true);
      setMessage(undefined);
      setLoading(false);
    } else {
      setEvmAddress(undefined);
      setIsValid(false);
      setMessage("Invalid address or ENS");
      setLoading(false);
    }
  }

  function closeModal(showNotif: boolean, canClose = true): void {
    if (!canClose) return;
    setEvmAddress(identity?.evmAddress);
    setFieldInput(identity?.evmAddress ?? "");
    setIsValid(true);
    setMessage(undefined);
    handleClose(showNotif);
    setIsSendingTx(false);
  }

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={() => closeModal(false, !isSendingTx)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <>
        <div className={styles.menu}>
          <button
            className={styles.menu_close}
            onClick={() => closeModal(false)}
          >
            <svg viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <p className={styles.menu_subtitle}>Add an EVM address for</p>
          <p className={styles.menu_title}>{identity?.domain}</p>
          <div className="mt-5 flex flex-col justify-center">
            <div className="mt-5">
              <TextField
                helperText={message ?? "Add your EVM address or your ENS name"}
                fullWidth
                label="Your EVM Address"
                id="outlined-basic"
                value={fieldInput ?? ""}
                variant="outlined"
                onChange={(e) => changeAddress(e.target.value)}
                color="secondary"
                required
                error={!isValid}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {loading && <CircularProgress size={24} />}
                    </InputAdornment>
                  ),
                }}
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
                  By adding an EVM address to your Starknet domain, you enhance
                  its functionality and connectivity. Your Starknet domain
                  automatically comes with an associated ENS subdomain connected
                  to all EVM chains and Rollups!
                </p>
              </div>
              <img src="/visuals/ecosystemMap.svg" className={styles.cardImg} />
            </div>
          </div>
        </div>
      </>
    </Modal>
  );
};

export default AddEvmAddrModal;
