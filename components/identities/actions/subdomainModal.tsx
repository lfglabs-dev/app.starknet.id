import React, { FunctionComponent, useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { useAccount } from "@starknet-react/core";
import { useContractWrite } from "@/hooks/useContract";
import { useIsValid } from "../../../hooks/naming";
import { numberToString } from "../../../utils/stringService";
import SelectIdentity from "../../domains/selectIdentity";
import { utils } from "starknetid.js";
import { Call } from "starknet";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";
import TransactionModal from "@/components/UI/transactionModal";

type SubdomainModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  domain?: string;
};

const SubdomainModal: FunctionComponent<SubdomainModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  domain,
}) => {
  const [targetTokenId, setTargetTokenId] = useState<number>(0);
  const [subdomain, setSubdomain] = useState<string>("");
  const encodedSubdomain: string = utils
    .encodeDomain(subdomain)[0]
    .toString(10);
  const isDomainValid = useIsValid(subdomain);
  const [callData, setCallData] = useState<Call[]>([]);
  const { address } = useAccount();
  const { addTransaction } = useNotificationManager();
  const { writeAsync: transfer_domain, data: transferDomainData } =
    useContractWrite({
      calls: callData,
    });
  const [isTxSent, setIsTxSent] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);

  function changeTokenId(value: number): void {
    setTargetTokenId(value);
  }

  function changeSubdomain(value: string): void {
    setSubdomain(value);
  }

  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);

    if (targetTokenId !== 0) {
      setCallData([
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "transfer_domain",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            targetTokenId,
          ],
        },
      ]);
    } else {
      setCallData([
        {
          contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
          entrypoint: "mint",
          calldata: [numberToString(newTokenId)],
        },
        {
          contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
          entrypoint: "transfer_domain",
          calldata: [
            Number(callDataEncodedDomain[0]) + 1,
            encodedSubdomain,
            ...callDataEncodedDomain.slice(1),
            newTokenId,
          ],
        },
      ]);
    }
  }, [targetTokenId, encodedSubdomain, callDataEncodedDomain, address]);

  useEffect(() => {
    if (!transferDomainData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `For ${domain}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.SUBDOMAIN_CREATION,
        hash: transferDomainData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    setIsSendingTx(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferDomainData]);

  async function transferDomain(): Promise<void> {
    try {
      setIsSendingTx(true);
      await transfer_domain();
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to transfer domain:", error);
    }
  }

  const modalContent = (
    <>
      <p className="mt-5">
        As you own {domain} you can create a subdomain of it using this form.
        This subdomain won&apos;t have any expiry date but the owner of the
        parent domain will always be able to redeem it.
      </p>
      <div className="mt-5 flex flex-col justify-center">
        <TextField
          fullWidth
          id="outlined-basic"
          label={
            isDomainValid !== true
              ? `"${isDomainValid}" is not a valid character`
              : "Subdomain"
          }
          placeholder="Subdomain"
          variant="outlined"
          onChange={(e) => changeSubdomain(e.target.value)}
          color="secondary"
          required
          error={isDomainValid !== true}
        />
        <SelectIdentity tokenId={targetTokenId} changeTokenId={changeTokenId} />
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
      sendTransaction={transferDomain}
      transactionHash={transferDomainData?.transaction_hash}
      isButtonDisabled={!subdomain || typeof isDomainValid === "string"}
      buttonCta="Create subdomain"
    />
  );
};

export default SubdomainModal;
