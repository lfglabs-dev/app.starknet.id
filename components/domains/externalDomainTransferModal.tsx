import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from "react";
import { TextField, InputAdornment } from "@mui/material";
import { useContractWrite } from "@/hooks/useContract";
import { useRouter } from "next/router";
import { isHexString, minifyAddress } from "../../utils/stringService";
import { utils } from "starknetid.js";
import { StarknetIdJsContext } from "../../context/StarknetIdJsProvider";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../utils/constants";
import { Call } from "starknet";
import resolverCalls from "@/utils/callData/resolverCalls";
import { getResolverCondition } from "@/utils/resolverService";
import TransactionModal from "@/components/UI/transactionModal";

type ExternalDomainsTransferModalProps = {
  domain: string;
  domainEncoded: string;
  resolverContract: string;
  handleClose: () => void;
  isModalOpen: boolean;
  domainKind: DomainKind;
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
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [callData, setCallData] = useState<Call[]>([]);

  const { writeAsync: transfer_name, data: transferData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    setCallData([
      resolverCalls.transferName(
        resolverContract,
        domainEncoded,
        targetAddress
      ),
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
      subtext: `${domain} transferred`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.TRANSFER_EXTERNAL_DOMAIN,
        hash: transferData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxSent(true);
    setIsSendingTx(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferData]);

  async function transferName(): Promise<void> {
    try {
      setIsSendingTx(true);
      await transfer_name();
    } catch (error) {
      setIsSendingTx(false);
      console.error("Failed to transfer domain:", error);
    }
  }

  function changeAddress(value: string): void {
    setAddressInput(value);
  }

  const modalContent = (
    <>
      {getResolverCondition(domainKind) && (
        <p className="mt-5 text-center">{getResolverCondition(domainKind)}</p>
      )}
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
      title="Transfer your domain to a different wallet"
      modalContent={modalContent}
      handleClose={handleClose}
      isModalOpen={isModalOpen}
      isTxSent={isTxSent}
      isSendingTx={isSendingTx}
      setIsSendingTx={setIsSendingTx}
      setIsTxSent={setIsTxSent}
      sendTransaction={transferName}
      transactionHash={transferData?.transaction_hash}
      isButtonDisabled={!targetAddress}
      buttonCta="Send domain"
    />
  );
};

export default ExternalDomainsTransferModal;
