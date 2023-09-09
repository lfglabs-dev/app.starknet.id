import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useEtherContract } from "../../hooks/contracts";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useTransactionManager,
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
import salesTax from "sales-tax";
import Wallets from "../UI/wallets";
import registerCalls from "../../utils/registerCalls";
import UsForm from "../domains/usForm";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";

type RegisterDiscountProps = {
  domain: string;
  duration: number;
  discountId: string;
  customMessage: string;
  price: string;
  mailGroups: string[];
};

const RegisterDiscount: FunctionComponent<RegisterDiscountProps> = ({
  domain,
  duration,
  discountId,
  customMessage,
  price,
  mailGroups,
}) => {
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isUsResident, setIsUsResident] = useState<boolean>(false);
  const [usState, setUsState] = useState<string>("DE");
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [callData, setCallData] = useState<Call[]>([]);
  const [balance, setBalance] = useState<string>("0");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const [salt, setSalt] = useState<string | undefined>();
  const { contract: etherContract } = useEtherContract();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const encodedDomain = utils
    .encodeDomain(domain)
    .map((element) => element.toString())[0];
  const [termsBox, setTermsBox] = useState<boolean>(true);
  // const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [metadataHash, setMetadataHash] = useState<string | undefined>();

  const { account, address } = useAccount();
  const { data: userBalanceData, error: userBalanceDataError } =
    useContractRead({
      address: etherContract?.address as string,
      abi: etherContract?.abi as Abi,
      functionName: "balanceOf",
      args: [address],
    });
  const { writeAsync: execute, data: registerData } = useContractWrite({
    // calls: renewalBox
    //   ? callData.concat(registerCalls.renewal(encodedDomain, price))
    //   : callData,
    calls: callData,
  });
  const hasMainDomain = !useDisplayName(address ?? "", false).startsWith("0x");
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const { addTransaction } = useTransactionManager();

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
          mailGroups,
          isUsResident ? usState : "none",
          salt
        )
      );
    })();
  }, [email, usState, salt]);

  useEffect(() => {
    if (userBalanceDataError || !userBalanceData) setBalance("0");
    else {
      const high = userBalanceData?.["balance"].high << BigInt(128);
      setBalance((userBalanceData?.["balance"].low + high).toString(10));
    }
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

  // Set mulitcalls
  useEffect(() => {
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const txMetadataHash = "0x" + metadataHash;
    const addressesMatch =
      hexToDecimal(address) === hexToDecimal(targetAddress);
    // Common calls
    const calls = [
      registerCalls.mint(newTokenId),
      registerCalls.approve(price),
      registerCalls.buy_discounted(
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
      calls.unshift(registerCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
    }

    // If the user do not have a main domain and the address match
    if (addressesMatch && !hasMainDomain) {
      calls.push(registerCalls.addressToDomain(encodedDomain));
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
  ]);

  useEffect(() => {
    if (!registerData?.transaction_hash) return;
    posthog?.capture("register", { onForceEmail });

    // register the metadata to the sales manager db
    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meta_hash: metadataHash,
        email,
        groups: mailGroups, // Domain Owner group + quantumleap group^
        tax_state: isUsResident ? usState : "none",
        salt: salt,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log("Error on sending metadata:", err));

    addTransaction({ hash: registerData?.transaction_hash ?? "" });
    setIsTxModalOpen(true);
  }, [registerData]);

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
  }

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

  // AB Testing
  const [onForceEmail, setOnForceEmail] = useState<boolean>();
  useEffect(() => {
    posthog.onFeatureFlags(function () {
      // feature flags should be available at this point
      if (
        posthog.getFeatureFlag("onforceEmail") == "test" ||
        process.env.NEXT_PUBLIC_IS_TESTNET === "true"
      ) {
        setOnForceEmail(true);
      } else {
        setOnForceEmail(false);
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <div className="flex flex-col items-start gap-4 self-stretch">
            <p className={styles.legend}>Your registration</p>
            <h3 className={styles.domain}>{getDomainWithStark(domain)}</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            <TextField
              helperText="Please understand that entering your email is not mandatory to register a domain, we won't share your email with anyone. We'll use it only to inform you about your domain and our news."
              label="Email address"
              value={email}
              onChange={(e) => changeEmail(e.target.value)}
              color="secondary"
              error={emailError}
              errorMessage="Please enter a valid email address"
            />
            <UsForm
              isUsResident={isUsResident}
              onUsResidentChange={() => setIsUsResident(!isUsResident)}
              usState={usState}
              changeUsState={(value) => setUsState(value)}
            />
          </div>
        </div>
        <div className={styles.summary}>
          <RegisterSummary
            ethRegistrationPrice={price}
            duration={Number(numberToFixedString(duration / 365))}
            renewalBox={false}
            salesTaxRate={salesTaxRate}
            isUsResident={isUsResident}
            isUsdPriceDisplayed={false}
            customMessage={customMessage}
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
            // onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            // renewalBox={renewalBox}
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
                (isUsResident && !usState) ||
                emailError
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : isUsResident && !usState
                ? "We need your US State"
                : invalidBalance
                ? "You don't have enough eth"
                : emailError
                ? "Enter a valid Email"
                : "Register my domain"}
            </Button>
          ) : (
            <Button onClick={() => setWalletModalOpen(true)}>
              Connect wallet
            </Button>
          )}
        </div>
      </div>
      <img className={styles.image} src="/visuals/registerV2.webp" />
      <TxConfirmationModal
        txHash={registerData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your domain is on it's way !"
      />
      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </div>
  );
};

export default RegisterDiscount;
