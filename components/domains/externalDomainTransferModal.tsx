import { InputAdornment, Modal, TextField } from "@mui/material";
import { useContractWrite } from "@starknet-react/core";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from "react";
import styles from "../../styles/components/modalMessage.module.css";
import { isHexString, minifyAddress } from "../../utils/stringService";
import Button from "../UI/button";
import { utils } from "starknetid.js";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";
import ConfirmationTx from "../UI/confirmationTx";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../utils/constants";
import { Call } from "starknet";

type ExternalDomainsTransferModalProps = {
  domain: string;
  domainEncoded: string;
  resolverContract: string;
  handleClose: () => void;
  isModalOpen: boolean;
  domainKind?: string;
};

const ExternalDomainsTransferModal: FunctionComponent<
  ExternalDomainsTransferModalProps
> = ({
  domainEncoded,
  resolverContract,
  handleClose,
  isModalOpen,
  domainKind,
}) => {
  const router = useRouter();
  const { externalDomain: domain } = router.query;
  const [targetAddress, setTargetAddress] = useState<string>("");
  const { addTransaction } = useNotificationManager();
  const [addressInput, setAddressInput] = useState<string>("");
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [isTxSent, setIsTxSent] = useState(false);
  const [callData, setCallData] = useState<Call[]>([]);

  const { writeAsync: transfer_name, data: transferData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    setCallData([
      {
        contractAddress: resolverContract,
        entrypoint: "transfer_name",
        calldata: [domainEncoded, targetAddress],
      },
    ]);
  }, [domainEncoded, targetAddress, resolverContract]);

  useEffect(() => {
    if (isHexString(addressInput)) {
      setTargetAddress(addressInput);
    } else if (utils.isStarkDomain(addressInput)) {
      starknetIdNavigator?.getAddressFromStarkName(addressInput).then((res) => {
        if (!res || res === "0x0") setTargetAddress("");
        else setTargetAddress(res);
      });
    } else {
      setTargetAddress("");
    }
  }, [addressInput, starknetIdNavigator]);

  useEffect(() => {
    if (!transferData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `${domain} transfered`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.TRANSFER_IDENTITY,
        hash: transferData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferData]); // We want to call this only once when the transaction is sent

  function transferName(): void {
    transfer_name();
  }

  function changeAddress(value: string): void {
    setAddressInput(value);
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
      {isTxSent ? (
        <ConfirmationTx
          closeModal={closeModal}
          txHash={transferData?.transaction_hash}
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
          <h2 className={styles.menu_title}>
            Transfer your domain to a different wallet
          </h2>
          {domainKind ? (
            <p className="mt-5 text-center">
              You can only transfer your subdomain to a {domainKind} wallet.
            </p>
          ) : null}
          <div className="mt-5 flex flex-col justify-center">
            <TextField
              label="To Address / SNS"
              id="outlined-end-adornment"
              fullWidth
              value={addressInput}
              variant="outlined"
              onChange={(e) => changeAddress(e.target.value)}
              color="secondary"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {targetAddress && utils.isStarkDomain(addressInput)
                      ? "(" + minifyAddress(targetAddress) + ")"
                      : ""}
                  </InputAdornment>
                ),
              }}
            />
            <div className="mt-5 flex justify-center">
              <Button disabled={!targetAddress} onClick={() => transferName()}>
                Send domain
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ExternalDomainsTransferModal;
