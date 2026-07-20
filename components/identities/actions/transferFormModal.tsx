import React, { type FunctionComponent, useEffect, useState } from "react";
import { InputAdornment } from "@mui/material";
import { useAccount } from "@starknet-react/core";
import TransactionModal from "@/components/UI/transactionModal";
import AdvancedTextField from "@/components/UI/advancedTextField";
import { usePreparedTransaction } from "@/hooks/useTransactions";
import {
  readDomainId,
  readOwnerOf,
  readUserData,
  STARKNET_FIELD,
} from "@/lib/chain/contracts";
import { normalizeDomain } from "@/lib/chain/domain";
import { normalizeAddress } from "@/lib/core/address";
import { prepareTransferIntent } from "@/lib/transactions/intents";
import { shortAddress } from "@/lib/ui/identity";

type TransferFormModalProps = {
  tokenId: string;
  handleClose: () => void;
  isModalOpen: boolean;
};

const TransferFormModal: FunctionComponent<TransferFormModalProps> = ({
  tokenId,
  handleClose,
  isModalOpen,
}) => {
  const { address } = useAccount();
  const submitPrepared = usePreparedTransaction();
  const [targetAddress, setTargetAddress] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [isTxSent, setIsTxSent] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    const value = addressInput.trim();
    setTargetAddress("");
    if (!value) return;
    try {
      setTargetAddress(normalizeAddress(value));
      return;
    } catch {
      // Domain destinations resolve through the mainnet naming contracts.
    }
    if (!value.toLowerCase().endsWith(".stark")) return;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const id = await readDomainId(normalizeDomain(value));
          if (id === "0") return;
          const [target, owner] = await Promise.all([
            readUserData(id, STARKNET_FIELD),
            readOwnerOf(id),
          ]);
          if (!cancelled && owner) {
            setTargetAddress(
              BigInt(target) === 0n ? owner : normalizeAddress(target)
            );
          }
        } catch {
          if (!cancelled) setTargetAddress("");
        }
      })();
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [addressInput]);

  async function transferIdentityAndSetDomain(): Promise<void> {
    if (!address) return;
    try {
      setIsSendingTx(true);
      const hash = await submitPrepared(() =>
        prepareTransferIntent(address, tokenId, targetAddress)
      );
      setTransactionHash(hash);
      setIsTxSent(true);
      setIsSendingTx(false);
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to transfer identity and set domain:", error);
    }
  }

  const modalContent = (
    <>
      <p className="mt-5 md:text-sm text-xs text-center text-[#8C8989] md:leading-6">
        An Identity is an NFT that everyone can mint for free that permits
        linking different types of data to it (Social Media, stark domain ...).
        This form enables you to send this identity to another wallet.
      </p>
      <div className="mt-5  flex flex-col justify-center w-full">
        <AdvancedTextField
          label="To Address / SNS"
          value={addressInput}
          onChange={(event) => setAddressInput(event.target.value)}
          color="secondary"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {targetAddress && addressInput.toLowerCase().endsWith(".stark")
                  ? `(${shortAddress(targetAddress)})`
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
      sendTransaction={() => void transferIdentityAndSetDomain()}
      transactionHash={transactionHash}
      isButtonDisabled={!targetAddress}
      buttonCta="Send domain"
    />
  );
};

export default TransferFormModal;
