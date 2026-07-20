import React, { type FunctionComponent, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import TransactionModal from "@/components/UI/transactionModal";
import { CustomTextField } from "@/components/UI/CustomTextField";
import { usePreparedTransaction } from "@/hooks/useTransactions";
import { normalizeAddress } from "@/lib/core/address";
import { prepareSetTargetIntent } from "@/lib/transactions/intents";
import type { IdentityView } from "@/lib/ui/identity";
import { shortAddress } from "@/lib/ui/identity";

type ChangeAddressModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  identity?: IdentityView;
  tokenId: string;
  currentTargetAddress?: string;
};

const ChangeAddressModal: FunctionComponent<ChangeAddressModalProps> = ({
  handleClose,
  isModalOpen,
  identity,
  tokenId,
  currentTargetAddress = "0",
}) => {
  const { address } = useAccount();
  const submitPrepared = usePreparedTransaction();
  const [targetAddress, setTargetAddress] = useState("");
  const [isTxSent, setIsTxSent] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>();

  useEffect(() => setTargetAddress(""), [tokenId]);

  async function setDomainToAddress(): Promise<void> {
    if (!address) return;
    try {
      setIsSendingTx(true);
      const hash = await submitPrepared(() =>
        prepareSetTargetIntent(address, tokenId, targetAddress)
      );
      setTransactionHash(hash);
      setIsTxSent(true);
      setIsSendingTx(false);
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to set domain to address:", error);
    }
  }

  function changeAddress(value: string): void {
    try {
      setTargetAddress(normalizeAddress(value));
    } catch {
      setTargetAddress("");
    }
  }

  const modalContent = (
    <div className="mt-5 flex flex-col justify-center">
      {currentTargetAddress && (
        <p
          className="font-normal text-sm leading-6 tracking-normal text-[#8C8989] text-center"
          style={{ fontFamily: "Poppins-Regular, sans-serif" }}
        >
          A stark domain resolves to a Starknet address, the current target
          address of {identity?.domain} is{" "}
          <strong className="font-bold text-[#454545]">
            {shortAddress(currentTargetAddress)}
          </strong>
          . You can change it by using this form.
        </p>
      )}
      <div className="mt-5">
        <CustomTextField
          fullWidth
          id="outlined-basic"
          placeholder="new target address"
          variant="outlined"
          onChange={(event) => changeAddress(event.target.value)}
          value={targetAddress}
          helperText="You need to copy paste a wallet address or it won't work"
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
      sendTransaction={() => void setDomainToAddress()}
      transactionHash={transactionHash}
      isButtonDisabled={!targetAddress}
      buttonCta="Set new address"
    />
  );
};

export default ChangeAddressModal;
