import React, { FunctionComponent, useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { isHexString, minifyAddress } from "../../../utils/stringService";
import { hexToDecimal } from "../../../utils/feltService";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";
import { Identity } from "../../../utils/apiWrappers/identity";
import identityChangeCalls from "../../../utils/callData/identityChangeCalls";
import TransactionModal from "@/components/UI/transactionModal";

type ChangeAddressModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  identity?: Identity;
  currentTargetAddress?: string;
};

const ChangeAddressModal: FunctionComponent<ChangeAddressModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  identity,
  currentTargetAddress = "0",
}) => {
  const { address } = useAccount();
  const [targetAddress, setTargetAddress] = useState<string>("");
  const { addTransaction } = useNotificationManager();
  const [isTxSent, setIsTxSent] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);

  const { sendAsync: set_domain_to_address, data: domainToAddressData } =
    useSendTransaction({
      calls: identity
        ? identityChangeCalls.setStarknetAddress(
            identity,
            hexToDecimal(targetAddress),
            callDataEncodedDomain
          )
        : [],
    });

  useEffect(() => {
    if (!domainToAddressData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: "Address updated",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.CHANGE_ADDRESS,
        hash: domainToAddressData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    setIsSendingTx(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainToAddressData]);

  async function setDomainToAddress(): Promise<void> {
    try {
      setIsSendingTx(true);
      await set_domain_to_address();
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to set domain to address:", error);
    }
  }

  function changeAddress(value: string): void {
    isHexString(value) ? setTargetAddress(value) : null;
  }

  const modalContent = (
    <div className="mt-5 flex flex-col justify-center">
      {currentTargetAddress && (
        <p>
          A stark domain resolves to a Starknet address, the current target
          address of {identity?.domain} is{" "}
          <strong>{minifyAddress(currentTargetAddress)}</strong>. You can change
          it by using this form.
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
    </div>
  );

  return (
    <TransactionModal
      title={`Change the target address of ${identity?.domain}`}
      modalContent={modalContent}
      handleClose={handleClose}
      isModalOpen={isModalOpen}
      isTxSent={isTxSent}
      isSendingTx={isSendingTx}
      setIsSendingTx={setIsSendingTx}
      setIsTxSent={setIsTxSent}
      sendTransaction={setDomainToAddress}
      transactionHash={domainToAddressData?.transaction_hash}
      isButtonDisabled={!targetAddress}
      buttonCta="Set new address"
    />
  );
};

export default ChangeAddressModal;
