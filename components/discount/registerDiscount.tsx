import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useAccount, useContractWrite } from "@starknet-react/core";
import { utils } from "starknetid.js";
import { getDomainWithStark, isValidEmail } from "../../utils/stringService";
import {
  applyRateToBigInt,
  hexToDecimal,
  numberToFixedString,
} from "../../utils/feltService";
import { useDisplayName } from "../../hooks/displayName.tsx";
import { Call } from "starknet";
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
  AutoRenewalContracts,
  CurrenciesType,
  ERC20Contract,
  NotificationType,
  TransactionType,
  swissVatRate,
} from "../../utils/constants";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import useAllowanceCheck from "../../hooks/useAllowanceCheck";
import ConnectButton from "../UI/connectButton";
import useBalances from "../../hooks/useBalances";
import {
  getAutoRenewAllowance,
  getDomainPriceAltcoin,
  getTokenQuote,
} from "../../utils/altcoinService";

type RegisterDiscountProps = {
  domain: string;
  duration: number;
  discountId: string;
  customMessage: string;
  priceInEth: string;
  mailGroups: string[];
  goBack: () => void;
};

const RegisterDiscount: FunctionComponent<RegisterDiscountProps> = ({
  domain,
  duration,
  discountId,
  customMessage,
  priceInEth,
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
  const [price, setPrice] = useState<string>(priceInEth); // set to priceInEth at initialization and updated to altcoin if selected by user
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null); // null if in ETH
  const [currencyDisplayed, setCurrencyDisplayed] = useState<CurrenciesType>(
    CurrenciesType.ETH
  );
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
  const { writeAsync: execute, data: registerData } = useContractWrite({
    calls: callData,
  });
  const hasMainDomain = !useDisplayName(address ?? "", false).startsWith("0x");
  const [domainsMinting, setDomainsMinting] = useState<Map<string, boolean>>(
    new Map()
  );
  const { addTransaction } = useNotificationManager();
  const needsAllowance = useAllowanceCheck(currencyDisplayed, address);
  const balances = useBalances(address); // fetch the user balances for all whitelisted tokens

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

  // refetch new quote if the timestamp from quote is expired
  useEffect(() => {
    const fetchQuote = () => {
      getTokenQuote(ERC20Contract[currencyDisplayed]).then((data) => {
        setQuoteData(data);
      });
    };

    const scheduleRefetch = () => {
      const now = parseInt((new Date().getTime() / 1000).toFixed(0));
      // Check if we need to refetch
      if (!quoteData || currencyDisplayed === CurrenciesType.ETH) {
        setQuoteData(null);
        // we don't need to check for quote until currencyDisplayed is updated
        return;
      }

      if (quoteData.max_quote_validity <= now) {
        fetchQuote();
      }

      // Calculate the time until the next validity check
      const timeUntilNextCheck = quoteData.max_quote_validity - now;
      setTimeout(scheduleRefetch, Math.max(15000, timeUntilNextCheck * 100));
    };

    // Initial fetch
    fetchQuote();
    // Start the refetch scheduling
    scheduleRefetch();
  }, [currencyDisplayed, price, ERC20Contract]);

  // we ensure user has enough balance of the token selected
  useEffect(() => {
    if (balances && price && currencyDisplayed) {
      const tokenBalance = balances[currencyDisplayed];
      if (tokenBalance && BigInt(tokenBalance) >= BigInt(price)) {
        setInvalidBalance(false);
      } else {
        setInvalidBalance(true);
      }
    }
  }, [price, currencyDisplayed, balances]);

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
    if (currencyDisplayed !== CurrenciesType.ETH && !quoteData) return;
    // Variables
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const txMetadataHash = "0x" + metadataHash;
    const addressesMatch =
      hexToDecimal(address) === hexToDecimal(targetAddress);

    // Common calls
    const calls = [
      registrationCalls.approve(price, ERC20Contract[currencyDisplayed]),
    ];

    if (currencyDisplayed === CurrenciesType.ETH) {
      calls.push(
        registrationCalls.buy(
          encodedDomain,
          newTokenId,
          "0",
          duration,
          txMetadataHash,
          discountId
        )
      );
    } else {
      calls.push(
        registrationCalls.altcoinBuy(
          encodedDomain,
          newTokenId,
          "0",
          duration,
          txMetadataHash,
          ERC20Contract[currencyDisplayed],
          quoteData as QuoteQueryData,
          discountId
        )
      );
    }

    // If the user is a US resident, we add the sales tax
    if (salesTaxRate) {
      calls.unshift(registrationCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
    }

    // If the user do not have a main domain and the address match
    if (addressesMatch && !hasMainDomain) {
      calls.push(registrationCalls.mainId(newTokenId));
    }

    // If the user has toggled autorenewal
    if (renewalBox) {
      if (needsAllowance) {
        calls.push(
          autoRenewalCalls.approve(
            ERC20Contract[currencyDisplayed],
            AutoRenewalContracts[currencyDisplayed]
          )
        );
      }

      const allowance = getAutoRenewAllowance(
        currencyDisplayed,
        salesTaxRate,
        price
      );
      calls.push(
        autoRenewalCalls.enableRenewal(
          AutoRenewalContracts[currencyDisplayed],
          encodedDomain,
          allowance,
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
    needsAllowance,
    discountId,
    quoteData,
    currencyDisplayed,
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

  useEffect(() => {
    if (currencyDisplayed === CurrenciesType.ETH) {
      setPrice(priceInEth);
    } else if (quoteData) {
      const priceInAltcoin = getDomainPriceAltcoin(quoteData.quote, priceInEth);
      setPrice(priceInAltcoin);
    }
  }, [priceInEth, quoteData]);

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
            registrationPrice={price}
            duration={Number(numberToFixedString(duration / 365))}
            renewalBox={false}
            salesTaxRate={salesTaxRate}
            isSwissResident={isSwissResident}
            currencyDisplayed={currencyDisplayed}
            onCurrencySwitch={setCurrencyDisplayed}
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
                ? `You don't have enough ${currencyDisplayed}`
                : emailError
                ? "Enter a valid Email"
                : "Register my domain"}
            </Button>
          ) : (
            <ConnectButton />
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
    </div>
  );
};

export default RegisterDiscount;
