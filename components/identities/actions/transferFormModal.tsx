import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from "react";
import { TextField, InputAdornment } from "@mui/material";
import { useContractWrite } from "@/hooks/useContract";
import { useRouter } from "next/router";
import { isHexString, minifyAddress } from "../../../utils/stringService";
import { utils } from "starknetid.js";
import { StarknetIdJsContext } from "../../../context/StarknetIdJsProvider";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";
import { Identity } from "../../../utils/apiWrappers/identity";
import identityChangeCalls from "../../../utils/callData/identityChangeCalls";
import TransactionModal from "@/components/UI/transactionModal";

type TransferFormModalProps = {
  identity: Identity | undefined;
  handleClose: () => void;
  isModalOpen: boolean;
};

const TransferFormModal: FunctionComponent<TransferFormModalProps> = ({
  identity,
  handleClose,
  isModalOpen,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const router = useRouter();
  const { tokenId } = router.query;
  const { addTransaction } = useNotificationManager();
  const [addressInput, setAddressInput] = useState<string>("");
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [isTxSent, setIsTxSent] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);

  const { writeAsync: transfer_identity_and_set_domain, data: transferData } =
    useContractWrite({
      calls: identity
        ? identityChangeCalls.transfer(identity, targetAddress)
        : [],
    });

  useEffect(() => {
    if (!transferData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `Identity ${tokenId} transferred`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.TRANSFER_IDENTITY,
        hash: transferData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    setIsSendingTx(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferData]);

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

  async function transferIdentityAndSetDomain(): Promise<void> {
    try {
      setIsSendingTx(true);
      await transfer_identity_and_set_domain();
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to transfer identity and set domain:", error);
    }
  }

  function changeAddress(value: string): void {
    setAddressInput(value);
  }

  const modalContent = (
    <>
      <p className="mt-5">
        An Identity is an NFT that everyone can mint for free that permits
        linking different types of data to it (Social Media, stark domain ...).
        This form enables you to send this identity to another wallet.
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
                  ? `(${minifyAddress(targetAddress)})`
                  : ""}
              </InputAdornment>
            ),
          }}
        />
      </div>
    </>
  );

  return (
    <TransactionModal
      title="Transfer your identity NFT to a different wallet"
      modalContent={modalContent}
      handleClose={handleClose}
      isModalOpen={isModalOpen}
      isTxSent={isTxSent}
      isSendingTx={isSendingTx}
      setIsSendingTx={setIsSendingTx}
      setIsTxSent={setIsTxSent}
      sendTransaction={transferIdentityAndSetDomain}
      transactionHash={transferData?.transaction_hash}
      isButtonDisabled={!targetAddress}
      buttonCta="Send domain"
    />
  );
};

export default TransferFormModal;
