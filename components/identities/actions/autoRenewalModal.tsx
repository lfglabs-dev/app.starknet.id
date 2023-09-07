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
import { Abi } from "starknet";
import { applyRateToBigInt, toUint256 } from "../../../utils/feltService";
import ConfirmationTx from "../../UI/confirmationTx";
import UsForm from "../../domains/usForm";
import RegisterCheckboxes from "../../domains/registerCheckboxes";
import RegisterSummary from "../../domains/registerSummary";
import salesTax from "sales-tax";

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
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [termsBox, setTermsBox] = useState<boolean>(true);
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

  const renewCallToggleRenewals = {
    contractAddress: process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
    entrypoint: "toggle_renewals",
    calldata: [
      callDataEncodedDomain[1],
      toUint256(limitPrice).low,
      toUint256(limitPrice).high,
    ],
  };

  const renewCallApprove = {
    contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
    entrypoint: "approve",
    calldata: [
      process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      "340282366920938463463374607431768211455",
      "340282366920938463463374607431768211455",
    ],
  };

  const renew_calls = needApproval
    ? [renewCallApprove, renewCallToggleRenewals]
    : [renewCallToggleRenewals];

  useEffect(() => {
    // check approval has been granted to renewal contract
    if (approvalError || !approvalData) return;
    if (
      approvalData?.["remaining"].low === BigInt(0) &&
      approvalData?.["remaining"].high === BigInt(0)
    )
      setNeedApproval(true);
  }, [approvalData, approvalError]);

  const { writeAsync: enableAutoRenewal, data: autorenewData } =
    useContractWrite({
      calls: renew_calls,
    });

  useEffect(() => {
    if (!autorenewData?.transaction_hash) return;
    addTransaction({ hash: autorenewData?.transaction_hash ?? "" });
    setIsTxSent(true);
  }, [autorenewData]);

  useEffect(() => {
    if (isUsResident) {
      salesTax.getSalesTax("US", usState).then((tax) => {
        setSalesTaxRate(tax.rate);
        if (price) setSalesTaxAmount(applyRateToBigInt(price, tax.rate));
      });
    } else {
      setSalesTaxRate(0);
      setSalesTaxAmount("");
    }
  }, [isUsResident, usState, price]);

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
            <UsForm
              isUsResident={isUsResident}
              onUsResidentChange={() => setIsUsResident(!isUsResident)}
              usState={usState}
              changeUsState={(value) => setUsState(value)}
            />
            <Divider className="w-full" />
            <RegisterSummary
              ethRegistrationPrice={limitPrice}
              duration={1}
              renewalBox={false}
              salesTaxRate={salesTaxRate}
              isUsResident={isUsResident}
              isAutoRenew
            />
            <Divider className="w-full" />
            <RegisterCheckboxes
              onChangeTermsBox={() => setTermsBox(!termsBox)}
              termsBox={termsBox}
            />
            <Button
              disabled={!termsBox || (isUsResident && !usState)}
              onClick={() => {
                enableAutoRenewal();
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
