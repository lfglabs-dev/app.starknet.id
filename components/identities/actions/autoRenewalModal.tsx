import { Modal } from "@mui/material";
import {
  useAccount,
  useContractRead,
  useContractWrite,
} from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useEtherContract, usePricingContract } from "../../../hooks/contracts";
import styles from "../../../styles/components/autoRenewal.module.css";
import Button from "../../UI/button";
import { timestampToReadableDate } from "../../../utils/dateService";
import { Abi, Call } from "starknet";
import ConfirmationTx from "../../UI/confirmationTx";
import UsForm from "../../domains/usForm";
import salesTax from "sales-tax";
import TextField from "../../UI/textField";
import {
  computeMetadataHash,
  generateSalt,
} from "../../../utils/userDataService";
import { formatHexString, isValidEmail } from "../../../utils/stringService";
import { applyRateToBigInt, gweiToEth } from "../../../utils/feltService";
import autoRenewalCalls from "../../../utils/callData/autoRenewalCalls";
import { UINT_128_MAX } from "../../../utils/constants";
import { useNotificationManager } from "../../../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../../../utils/constants";

type AutoRenewalModalProps = {
  handleClose: () => void;
  isModalOpen: boolean;
  callDataEncodedDomain: (number | string)[];
  identity?: Identity;
  domain?: string;
  allowance?: string;
};

const AutoRenewalModal: FunctionComponent<AutoRenewalModalProps> = ({
  handleClose,
  isModalOpen,
  callDataEncodedDomain,
  identity,
  domain,
  allowance,
}) => {
  const { address } = useAccount();
  const [price, setPrice] = useState<string>("0");
  const [renewalAllowance, setRenewalAllowance] = useState<string>(
    allowance ?? "0"
  );
  const [isTxSent, setIsTxSent] = useState(false);
  const [isUsResident, setIsUsResident] = useState<boolean>(false);
  const [usState, setUsState] = useState<string>("DE");
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [email, setEmail] = useState<string>("");
  const groups: string[] = [
    process.env.NEXT_PUBLIC_MAILING_LIST_GROUP_AUTO_RENEWAL ?? "",
  ];
  const [emailError, setEmailError] = useState<boolean>(true);
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [needMedadata, setNeedMetadata] = useState<boolean>(true);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: pricingContract } = usePricingContract();
  const { contract: etherContract } = useEtherContract();
  const { addTransaction } = useNotificationManager();
  const { data: priceData, error: priceError } = useContractRead({
    address: pricingContract?.address as string,
    abi: pricingContract?.abi as Abi,
    functionName: "compute_renew_price",
    args: [callDataEncodedDomain[1], 365],
  });
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
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
      console.log("priceData", priceData);
      const high = priceData?.["price"].high << BigInt(128);
      setPrice((priceData?.["price"].low + high).toString(10));
    }
  }, [priceData, priceError]);

  useEffect(() => {
    if (renewalAllowance === "0") setRenewalAllowance(price);
  }, [address, domain, price, renewalAllowance]);

  // on first load, we generate a salt
  useEffect(() => {
    setSalt(generateSalt());
  }, []);

  useEffect(() => {
    if (!identity?.owner_addr) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_metahash?addr=${identity?.owner_addr}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.meta_hash) {
          setNeedMetadata(false);
          setMetadataHash(data.meta_hash);
          if (data.tax_rate) setSalesTaxRate(data.tax_rate);
          else setSalesTaxRate(0);
        } else setNeedMetadata(true);
      })
      .catch((err) => {
        console.log("Error while fetching metadata:", err);
        setNeedMetadata(true);
      });
  }, [identity]);

  // we update compute the purchase metadata hash
  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salt || !needMedadata) return;
    (async () => {
      setMetadataHash(
        await computeMetadataHash(email, isUsResident ? usState : "none", salt)
      );
    })();
  }, [usState, salt, email, needMedadata]);

  useEffect(() => {
    console.log("price 1s", price, "salesTaxRate", salesTaxRate);
    if (!needMedadata && price) {
      setSalesTaxAmount(applyRateToBigInt(price, salesTaxRate));
    } else {
      if (isUsResident) {
        salesTax.getSalesTax("US", usState).then((tax) => {
          setSalesTaxRate(tax.rate);
          if (price) setSalesTaxAmount(applyRateToBigInt(price, tax.rate));
        });
      } else {
        setSalesTaxRate(0);
      }
    }
  }, [isUsResident, usState, price, needMedadata, salesTaxRate]);

  // Set Enable Auto Renewal Multicall
  useEffect(() => {
    if (!price || !salesTaxAmount) return;
    const calls: Call[] = [];
    if (
      erc20AllowanceError ||
      (erc20AllowanceData &&
        erc20AllowanceData["remaining"].low !== UINT_128_MAX &&
        erc20AllowanceData["remaining"].high !== UINT_128_MAX)
    ) {
      calls.push(autoRenewalCalls.approve());
    }

    const txMetadataHash = "0x" + metadataHash;
    console.log("price", price, "salesTaxAmount", salesTaxAmount);
    const finalPrice = BigInt(price) + BigInt(salesTaxAmount);
    console.log("finalPrice", finalPrice);
    calls.push(
      autoRenewalCalls.enableRenewal(
        callDataEncodedDomain[1].toString(),
        finalPrice.toString(),
        txMetadataHash
      )
    );
    setCallData(calls);
  }, [price, salesTaxRate, metadataHash, erc20AllowanceData]);

  useEffect(() => {
    if (!autorenewData?.transaction_hash || !salt) return;
    // posthog?.capture("register");

    // register the metadata to the sales manager db
    // when enabling auto renewal, if user wasn't already registered
    if (needMedadata) {
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_hash: metadataHash,
          email,
          tax_state: isUsResident ? usState : "none",
          salt: salt,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log("Error while sending metadata:", err));
    }

    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/mail_subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_hash: formatHexString(autorenewData.transaction_hash),
        groups,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log("Error on registering to email:", err));

    addTransaction({
      timestamp: Date.now(),
      subtext: `Enabled auto renewal for ${domain}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.ENABLE_AUTORENEW,
        hash: autorenewData.transaction_hash,
        status: "pending",
      },
    });
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
                )} at ${gweiToEth(renewalAllowance)} ETH.`
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
            <div className={`${!needMedadata ? "mx-auto" : ""}`}>
              <Button
                disabled={isUsResident && !usState}
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
