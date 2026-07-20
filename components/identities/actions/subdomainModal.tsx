import React, { type FunctionComponent, useState } from "react";
import { useAccount } from "@starknet-react/core";
import TransactionModal from "@/components/UI/transactionModal";
import AdvancedTextField from "@/components/UI/advancedTextField";
import SelectIdentity from "@/components/domains/selectIdentity";
import { usePreparedTransaction } from "@/hooks/useTransactions";
import type { OwnedIdentity } from "@/lib/core/types";
import { prepareSubdomainIntent } from "@/lib/transactions/intents";

type SubdomainModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  domain?: string;
  identities: OwnedIdentity[];
};

const SubdomainModal: FunctionComponent<SubdomainModalProps> = ({
  handleClose,
  isModalOpen,
  domain,
  identities,
}) => {
  const { address } = useAccount();
  const submitPrepared = usePreparedTransaction();
  const [targetTokenId, setTargetTokenId] = useState("new");
  const [subdomain, setSubdomain] = useState("");
  const [isTxSent, setIsTxSent] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>();
  const invalidCharacter = Array.from(subdomain).find(
    (character) => !"abcdefghijklmnopqrstuvwxyz0123456789-这来".includes(character)
  );

  async function transferDomain(): Promise<void> {
    if (!address || !domain) return;
    try {
      setIsSendingTx(true);
      const hash = await submitPrepared(() =>
        prepareSubdomainIntent({
          owner: address,
          rootDomain: domain,
          label: subdomain,
          targetTokenId: targetTokenId === "new" ? undefined : targetTokenId,
          mintIdentity: targetTokenId === "new",
        })
      );
      setTransactionHash(hash);
      setIsTxSent(true);
      setIsSendingTx(false);
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to transfer domain:", error);
    }
  }

  const modalContent = (
    <>
      <div className="bg-[#FCFFFE]">
        <p className="mt-5 text-center text-[#8C8989]">
          As you own {domain} you can create a subdomain of it using this form.
          This subdomain won&apos;t have any expiry date but the owner of the
          parent domain will always be able to redeem it.
        </p>
      </div>
      <div className="mt-5 flex flex-col justify-center w-full bg-[#FCFFFE]">
        <AdvancedTextField
          fullWidth
          label={
            invalidCharacter
              ? `"${invalidCharacter}" is not a valid character`
              : "Subdomain"
          }
          value={subdomain}
          onChange={(event) => setSubdomain(event.target.value.toLowerCase())}
          color="secondary"
          error={Boolean(invalidCharacter)}
        />
        <div className="mt-6">
          <SelectIdentity
            identities={identities}
            value={targetTokenId}
            onChange={setTargetTokenId}
          />
        </div>
      </div>
    </>
  );

  return (
    <TransactionModal
      title={`Create a subdomain of ${domain}`}
      modalContent={modalContent}
      handleClose={handleClose}
      isModalOpen={isModalOpen}
      isTxSent={isTxSent}
      isSendingTx={isSendingTx}
      setIsSendingTx={setIsSendingTx}
      setIsTxSent={setIsTxSent}
      sendTransaction={() => void transferDomain()}
      transactionHash={transactionHash}
      isButtonDisabled={!subdomain || Boolean(invalidCharacter)}
      buttonCta="Create subdomain"
    />
  );
};

export default SubdomainModal;
