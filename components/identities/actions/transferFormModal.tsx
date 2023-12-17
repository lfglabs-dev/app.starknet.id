import { InputAdornment, Modal, TextField } from "@mui/material";
import { useAccount, useContractWrite } from "@starknet-react/core";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from "react";
import styles from "../../../styles/components/modalMessage.module.css";
import { hexToDecimal } from "../../../utils/feltService";
import { isHexString, minifyAddress } from "../../../utils/stringService";
import Button from "../../UI/button";
import { utils } from "starknetid.js";
import { StarknetIdJsContext } from "../../../context/StarknetIdJsProvider";
import ConfirmationTx from "../../UI/confirmationTx";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";
import { Identity } from "../../../utils/apiWrappers/identity";
import identityChangeCalls from "../../../utils/callData/identityChangeCalls";

type TransferFormModalProps = {
  identity: Identity | undefined;
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
};

const TransferFormModal: FunctionComponent<TransferFormModalProps> = ({
  identity,
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const router = useRouter();
  const { address } = useAccount();
  const { tokenId } = router.query;
  const { addTransaction } = useNotificationManager();
  const [addressInput, setAddressInput] = useState<string>("");
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [isTxSent, setIsTxSent] = useState(false);

  const { writeAsync: transfer_identity_and_set_domain, data: transferData } =
    useContractWrite({
      calls: identity ? identityChangeCalls.transfer(identity, targetAddress) : [],
    });

  useEffect(() => {
    if (!transferData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `Identity ${tokenId} transfered`,
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

  function transferIdentityAndSetDomain(): void {
    transfer_identity_and_set_domain();
  }

  function changeAddress(value: string): void {
    setAddressInput(value);
  }

  return (
    <Modal
      disableAutoFocus
      open={isModalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      {isTxSent ? (
        <ConfirmationTx
          closeModal={handleClose}
          txHash={transferData?.transaction_hash}
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
          <h2 className={styles.menu_title}>
            Transfer your identity NFT to a different wallet
          </h2>
          <p className="mt-5">
            An Identity is an NFT that everyone can mint for free that permits
            to link different types of data to it (Social Media, stark domain
            ...). This form enables you to send this identity to another wallet.
          </p>
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
              <Button
                disabled={!targetAddress}
                onClick={() => transferIdentityAndSetDomain()}
              >
                Send domain
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TransferFormModal;
