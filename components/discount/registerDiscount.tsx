import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
} from "@starknet-react/core";
import { utils } from "starknetid.js";
import { getDomainWithStark, isValidEmail } from "../../utils/stringService";
import {
  applyRateToBigInt,
  gweiToEth,
  hexToDecimal,
  numberToFixedString,
} from "../../utils/feltService";
import { useDisplayName } from "../../hooks/displayName.tsx";
import { Abi, Call } from "starknet";
import { posthog } from "posthog-js";
import TxConfirmationModal from "../UI/txConfirmationModal";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import { Divider } from "@mui/material";
import RegisterCheckboxes from "../domains/registerCheckboxes";
import RegisterSummary from "../domains/registerSummary";
import registrationCalls from "../../utils/callData/registrationCalls";
import SwissForm from "../domains/swissForm";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";
import BackButton from "../UI/backButton";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import {
  NotificationType,
  TransactionType,
  UINT_128_MAX,
  swissVatRate,
} from "../../utils/constants";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import { useEtherContract } from "../../hooks/contracts";
import { CDNImg } from "../cdn/image";
import ConnectButton from "../UI/connectButton";

type RegisterDiscountProps = {
  domain: string;
  duration: number;
  discountId: string;
  customMessage: string;
  price: string;
  mailGroups: string[];
  goBack: () => void;
};

const RegisterDiscount: FunctionComponent<RegisterDiscountProps> = ({
  domain,
  duration,
  discountId,
  customMessage,
  price,
  mailGroups,
  goBack,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isSwissResident, setIsSwissResident] = useState<boolean>(false);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [callData, setCallData] = useState<Call[]>([]);
  const [balance, setBalance] = useState<string>("0");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const [salt, setSalt] = useState<string | undefined>();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const encodedDomain = utils
    .encodeDomain(domain)
    .map((element) => element.toString())[0];
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const { account, address } = useAccount();
  const { data: userBalanceData, error: userBalanceDataError } = useBalance({
    address,
    watch: true,
  });
  const { writeAsync: execute, data: registerData } = useContractWrite({
    calls: callData,
  });
  const hasMainDomain = !useDisplayName(address ?? "", false).startsWith("0x");
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const { contract: etherContract } = useEtherContract();
  const { addTransaction } = useNotificationManager();
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
          email,
          //mailGroups,
          isSwissResident ? "switzerland" : "none",
          salt
        )
      );
    })();
  }, [email, isSwissResident, salt]);

  useEffect(() => {
    if (userBalanceDataError || !userBalanceData) setBalance("0");
    else setBalance(userBalanceData.value.toString(10));
  }, [userBalanceData, userBalanceDataError]);

  useEffect(() => {
    if (balance && price) {
      if (gweiToEth(balance) > gweiToEth(price)) {
        setInvalidBalance(false);
      } else {
        setInvalidBalance(true);
      }
    }
  }, [balance, price]);

  useEffect(() => {
    if (address) {
      setTargetAddress(address);
    }
  }, [address]);

  // Set sponsor
  // useEffect(() => {
  //   const referralData = localStorage.getItem("referralData");
  //   if (referralData) {
  //     const data = JSON.parse(referralData);
  //     if (data.sponsor && data?.expiry >= new Date().getTime()) {
  //       setSponsor(data.sponsor);
  //     } else {
  //       setSponsor("0");
  //     }
  //   } else {
  //     setSponsor("0");
  //   }
  // }, [domain]);

  // Set Register Multicall
  useEffect(() => {
    // Variables
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const txMetadataHash = "0x" + metadataHash;
    const addressesMatch =
      hexToDecimal(address) === hexToDecimal(targetAddress);

    // Common calls
    const calls = [
      registrationCalls.approve(price),
      registrationCalls.buy_discounted(
        encodedDomain,
        newTokenId,
        targetAddress,
        duration,
        discountId,
        txMetadataHash
      ),
    ];

    // If the user is a US resident, we add the sales tax
    if (salesTaxRate) {
      calls.unshift(registrationCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
    }

    // If the user do not have a main domain and the address match
    if (addressesMatch && !hasMainDomain) {
      calls.push(registrationCalls.addressToDomain(encodedDomain));
    }

    // If the user has toggled autorenewal
    if (renewalBox) {
      if (
        erc20AllowanceError ||
        (erc20AllowanceData &&
          erc20AllowanceData["remaining"].low !== UINT_128_MAX &&
          erc20AllowanceData["remaining"].high !== UINT_128_MAX)
      ) {
        calls.push(autoRenewalCalls.approve());
      }
      const limitPrice = salesTaxAmount
        ? (BigInt(salesTaxAmount) + BigInt(price)).toString()
        : price;
      calls.push(
        autoRenewalCalls.enableRenewal(
          encodedDomain,
          limitPrice,
          txMetadataHash
        )
      );
    }

    // Merge and set the call data
    setCallData(calls);
  }, [
    duration,
    targetAddress,
    price,
    domain,
    hasMainDomain,
    address,
    metadataHash,
    salesTaxRate,
    encodedDomain,
    renewalBox,
    salesTaxAmount,
    erc20AllowanceError,
    erc20AllowanceData,
    discountId,
  ]);

  useEffect(() => {
    if (!registerData?.transaction_hash) return;
    posthog?.capture("register");

    // register the metadata to the sales manager db
    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meta_hash: metadataHash,
        email,
        groups: mailGroups, // Domain Owner group + quantumleap group^
        tax_state: isSwissResident ? "switzerland" : "none",
        salt: salt,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log("Error on sending metadata:", err));

    addTransaction({
      timestamp: Date.now(),
      subtext: "Domain registration",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.BUY_DOMAIN,
        hash: registerData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerData]); // We want to execute this only once after the tx is sent

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
  }

  useEffect(() => {
    if (isSwissResident) {
      setSalesTaxRate(swissVatRate);
      setSalesTaxAmount(applyRateToBigInt(price, swissVatRate));
    } else {
      setSalesTaxRate(0);
      setSalesTaxAmount("");
    }
  }, [isSwissResident, price]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <BackButton onClick={() => goBack()} />
          <div className="flex flex-col items-start gap-4 self-stretch">
            <p className={styles.legend}>Your registration</p>
            <h3 className={styles.domain}>{getDomainWithStark(domain)}</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            <TextField
              helperText="We won't share your email with anyone. We'll use it only to inform you about your domain and our news, you can unsubscribe at any moment."
              label="Email address"
              value={email}
              onChange={(e) => changeEmail(e.target.value)}
              color="secondary"
              error={emailError}
              errorMessage="Please enter a valid email address"
            />
            <SwissForm
              isSwissResident={isSwissResident}
              onSwissResidentChange={() => setIsSwissResident(!isSwissResident)}
            />
          </div>
        </div>
        <div className={styles.summary}>
          <RegisterSummary
            ethRegistrationPrice={price}
            duration={Number(numberToFixedString(duration / 365))}
            renewalBox={false}
            salesTaxRate={salesTaxRate}
            isSwissResident={isSwissResident}
            isUsdPriceDisplayed={false}
            customMessage={customMessage}
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
            onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            renewalBox={renewalBox}
          />
          {address ? (
            <Button
              onClick={() =>
                execute().then(() =>
                  setDomainsMinting((prev) =>
                    new Map(prev).set(encodedDomain.toString(), true)
                  )
                )
              }
              disabled={
                (domainsMinting.get(encodedDomain) as boolean) ||
                !account ||
                !duration ||
                !targetAddress ||
                invalidBalance ||
                !termsBox ||
                emailError
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : invalidBalance
                ? "You don't have enough eth"
                : emailError
                ? "Enter a valid Email"
                : "Register my domain"}
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
      <CDNImg className={styles.image} src="/visuals/registerV2.webp" />
      <TxConfirmationModal
        txHash={registerData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your domain is on it's way !"
      />
    </div>
  );
};

export default RegisterDiscount;
