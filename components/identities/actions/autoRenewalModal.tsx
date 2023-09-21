import { Modal } from "@mui/material";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useEtherContract, usePricingContract } from "../../../hooks/contracts";
import styles from "../../../styles/components/autoRenewal.module.css";
import Button from "../../UI/button";
import { timestampToReadableDate } from "../../../utils/dateService";
import { Abi, Call } from "starknet";
import ConfirmationTx from "../../UI/confirmationTx";
import UsForm from "../../domains/usForm";
import RegisterCheckboxes from "../../domains/registerCheckboxes";
import salesTax from "sales-tax";
import TextField from "../../UI/textField";
import {
  computeMetadataHash,
  generateSalt,
} from "../../../utils/userDataService";
import registerCalls from "../../../utils/registerCalls";
import { isValidEmail } from "../../../utils/stringService";
import { applyRateToBigInt, gweiToEth } from "../../../utils/feltService";

type AutoRenewalModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  identity?: Identity;
  domain?: string;
  limit?: string;
};

const AutoRenewalModal: FunctionComponent<AutoRenewalModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  identity,
  domain,
  limit,
}) => {
  const { address } = useAccount();
  const [price, setPrice] = useState<string>("0");
  const [limitPrice, setLimitPrice] = useState<string>(limit ?? "0");
  const [needApproval, setNeedApproval] = useState<boolean>(false);
  const [isTxSent, setIsTxSent] = useState(false);
  const [isUsResident, setIsUsResident] = useState<boolean>(false);
  const [usState, setUsState] = useState<string>("DE");
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [email, setEmail] = useState<string>("");
  const [groups, setGroups] = useState<string[]>(["98125177486837731"]);
  const [emailError, setEmailError] = useState<boolean>(true);
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [needMedadata, setNeedMetadata] = useState<boolean>(true);
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

  useEffect(() => {
    if (!identity?.addr) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_metahash?addr=${identity?.addr}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
      })
      .catch((err) => console.log("Error while fetching metadata:", err));
  }, [identity]);

  // we update compute the purchase metadata hash
  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salt || !needMedadata) return;
    (async () => {
      setMetadataHash(
        await computeMetadataHash(
          email,
          groups,
          isUsResident ? usState : "none",
          salt
        )
      );
    })();
  }, [usState, salt, email, needMedadata]);

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
        if (price) setSalesTaxAmount(applyRateToBigInt(price, tax.rate));
      });
    } else {
      setSalesTaxRate(0);
    }
  }, [isUsResident, usState, price]);

  // Set Enable Auto Renewal Multicall
  useEffect(() => {
    const txMetadataHash = "0x" + metadataHash;
    const finalPrice = Number(price) + Number(salesTaxAmount);
    setCallData(
      registerCalls.enableRenewal(
        callDataEncodedDomain[1].toString(),
        finalPrice.toString(),
        txMetadataHash
      )
    );
  }, [needApproval, price, salesTaxRate, metadataHash]);

  useEffect(() => {
    if (!autorenewData?.transaction_hash || !salt) return;
    // posthog?.capture("register");

    // register the metadata to the sales manager db
    // when enabling auto renewal, if user wasn't already registered
    if (needMedadata)
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_hash: metadataHash,
          email,
          groups,
          tax_state: isUsResident ? usState : "none",
          salt: salt,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log("Error while sending metadata:", err));

    addTransaction({ hash: autorenewData?.transaction_hash ?? "" });
    setIsTxSent(true);
  }, [autorenewData, usState, salt]);

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
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
          txHash={autorenewData?.transaction_hash}
        />
      ) : (
        <div className={`${styles.menu} "overflow-scroll"`}>
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
            <div className="flex flex-col items-start gap-4 self-center">
              <h2 className={styles.title}>Enable auto renewal</h2>
            </div>
            <div className="flex flex-col items-start gap-4 self-center">
              <p className={styles.desc}>
                Enable automatic domain renewal to ensure uninterrupted
                ownership and benefits. Never worry about expiration dates
                again.{" "}
                {identity?.domain_expiry
                  ? `Your domain will be renewed for 1 year on  
                ${timestampToReadableDate(
                  identity.domain_expiry - 2592000
                )} at ${gweiToEth(limitPrice)} ETH.`
                  : null}
              </p>
            </div>
            {needMedadata ? (
              <>
                <div className="flex flex-col items-start gap-6 self-stretch">
                  <TextField
                    helperText="We won't share your email with anyone. We'll use it only to inform you about your domain and our news."
                    label="Your email address"
                    value={email}
                    onChange={(e) => changeEmail(e.target.value)}
                    color="secondary"
                    error={emailError}
                    errorMessage={"Please enter a valid email address"}
                    type="email"
                    variant="white"
                  />
                </div>
                <UsForm
                  isUsResident={isUsResident}
                  onUsResidentChange={() => setIsUsResident(!isUsResident)}
                  usState={usState}
                  changeUsState={(value) => setUsState(value)}
                  variant="white"
                />
              </>
            ) : null}
            <>
              <RegisterCheckboxes
                onChangeTermsBox={() => setTermsBox(!termsBox)}
                termsBox={termsBox}
                variant="white"
              />
            </>
            <div>
              <Button
                disabled={!termsBox || (isUsResident && !usState)}
                onClick={() => {
                  execute();
                }}
              >
                Enable auto renewal
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AutoRenewalModal;
