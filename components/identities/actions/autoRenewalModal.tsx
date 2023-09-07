import { Divider, Modal } from "@mui/material";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useEtherContract, usePricingContract } from "../../../hooks/contracts";
import styles from "../../../styles/components/autoRenewal.module.css";
import formStyles from "../../../styles/components/registerV2.module.css";
import Button from "../../UI/button";
import { timestampToReadableDate } from "../../../utils/dateService";
import { Abi, Call } from "starknet";
import ConfirmationTx from "../../UI/confirmationTx";
import UsForm from "../../domains/usForm";
import RegisterCheckboxes from "../../domains/registerCheckboxes";
import RegisterSummary from "../../domains/registerSummary";
import salesTax from "sales-tax";
import {
  computeMetadataHash,
  generateSalt,
} from "../../../utils/userDataService";
import registerCalls from "../../../utils/registerCalls";

type AutoRenewalModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  identity?: Identity;
  isEnabled?: boolean;
  domain?: string;
  limitPrice?: string;
};

const AutoRenewalModal: FunctionComponent<AutoRenewalModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  identity,
  isEnabled,
  domain,
}) => {
  const { address } = useAccount();
  const [price, setPrice] = useState<string>("0");
  const [limitPrice, setLimitPrice] = useState<string>("0");
  const [needApproval, setNeedApproval] = useState<boolean>(false);
  const [isTxSent, setIsTxSent] = useState(false);
  const [isUsResident, setIsUsResident] = useState<boolean>(false);
  const [usState, setUsState] = useState<string>("DE");
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [groups, setGroups] = useState<string[]>(["98125177486837731"]);
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: pricingContract } = usePricingContract();
  const { contract: etherContract } = useEtherContract();
  const { addTransaction } = useTransactionManager();
  const { data: priceData, error: priceError } = useContractRead({
    address: pricingContract?.address as string,
    abi: pricingContract?.abi as Abi,
    functionName: "compute_renew_price",
    args: [callDataEncodedDomain[1], 365],
  });
  const { data: approvalData, error: approvalError } = useContractRead({
    address: etherContract?.address as string,
    abi: etherContract?.abi as Abi,
    functionName: "allowance",
    args: [
      address as string,
      process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
    ],
  });
  const { writeAsync: execute, data: autorenewData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    if (priceError || !priceData) setPrice("0");
    else {
      const high = priceData?.["price"].high << BigInt(128);
      setPrice((priceData?.["price"].low + high).toString(10));
    }
  }, [priceData, priceError]);

  useEffect(() => {
    if (limitPrice === "0") setLimitPrice(price);
  }, [address, domain, price, limitPrice]);

  // on first load, we generate a salt
  useEffect(() => {
    setSalt(generateSalt());
  }, []);

  // we update compute the purchase metadata hash
  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salt) return;
    (async () => {
      setMetadataHash(
        await computeMetadataHash(
          "",
          groups,
          isUsResident ? usState : "none",
          salt
        )
      );
    })();
  }, [usState, salt]);

  useEffect(() => {
    // check approval has been granted to renewal contract
    if (approvalError || !approvalData) return;
    if (
      approvalData?.["remaining"].low === BigInt(0) &&
      approvalData?.["remaining"].high === BigInt(0)
    )
      setNeedApproval(true);
  }, [approvalData, approvalError]);

  useEffect(() => {
    if (isUsResident) {
      salesTax.getSalesTax("US", usState).then((tax) => {
        setSalesTaxRate(tax.rate);
      });
    } else {
      setSalesTaxRate(0);
    }
  }, [isUsResident, usState, price]);

  // Set Renewal Multicall
  useEffect(() => {
    if (isEnabled) {
      setCallData(
        registerCalls.disableRenewal(
          callDataEncodedDomain[1].toString(),
          limitPrice
        )
      );
    } else {
      const txMetadataHash = "0x" + metadataHash;
      setCallData(
        registerCalls.enableRenewal(
          callDataEncodedDomain[1].toString(),
          limitPrice,
          txMetadataHash
        )
      );
    }
  }, [needApproval, isEnabled]);

  useEffect(() => {
    if (!autorenewData?.transaction_hash || !salt) return;
    // posthog?.capture("register");

    if (!isEnabled) {
      // register the metadata to the sales manager db
      // only when enabling auto renewal
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_hash: metadataHash,
          email: "",
          groups,
          tax_state: isUsResident ? usState : "none",
          salt: salt,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log("Error while sending metadata:", err));
    }

    addTransaction({ hash: autorenewData?.transaction_hash ?? "" });
    setIsTxSent(true);
  }, [autorenewData, usState, salt]);

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
          txHash={autorenewData?.transaction_hash}
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
          <div className={styles.form}>
            <div className="flex flex-col items-start gap-4 self-stretch">
              <p className={formStyles.legend}>
                {isEnabled ? "Disable" : "Enable"} auto renewal for{" "}
              </p>
              <h3 className={formStyles.domain}>{identity?.domain}</h3>
            </div>
            <div className="flex flex-col items-start gap-4 self-stretch">
              <p className={formStyles.legend}>
                Avoid losing your domain and renew it automatically each year
                one month before it expires! (You can disable this option when
                you want.)
              </p>
            </div>
            {identity?.domain_expiry ? (
              <div className="flex flex-col items-start gap-4 self-stretch">
                <div className="flex flex-row items-center gap-4 self-stretch">
                  <p className={formStyles.legend}>Expiry date:</p>
                  <p className={formStyles.legend}>
                    {timestampToReadableDate(identity?.domain_expiry ?? 0)}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-4 self-stretch">
                  <p className={formStyles.legend}>Auto renewal date:</p>
                  <p className={formStyles.legend}>
                    {timestampToReadableDate(
                      identity?.domain_expiry - 2592000 ?? 0
                    )}
                  </p>
                </div>
              </div>
            ) : null}
            {!isEnabled ? (
              <UsForm
                isUsResident={isUsResident}
                onUsResidentChange={() => setIsUsResident(!isUsResident)}
                usState={usState}
                changeUsState={(value) => setUsState(value)}
              />
            ) : null}
            <Divider className="w-full" />
            <RegisterSummary
              ethRegistrationPrice={limitPrice}
              duration={1}
              renewalBox={false}
              salesTaxRate={salesTaxRate}
              isUsResident={isUsResident}
              isAutoRenew
            />
            {!isEnabled ? (
              <>
                <Divider className="w-full" />
                <RegisterCheckboxes
                  onChangeTermsBox={() => setTermsBox(!termsBox)}
                  termsBox={termsBox}
                />
              </>
            ) : null}
            <Button
              disabled={!termsBox || (isUsResident && !usState)}
              onClick={() => {
                execute();
              }}
            >
              {isEnabled ? "Disable" : "Enable"} auto renewal
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AutoRenewalModal;
