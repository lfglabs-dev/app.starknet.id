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
  CurrencyType,
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
import { getDomainPriceWei } from "@/utils/priceService";

type RegisterDiscountProps = {
  domain: string;
  durationInDays: number;
  discountId: string;
  customMessage: string;
  priceInEth: string;
  mailGroups: string[];
  goBack: () => void;
};

const RegisterDiscount: FunctionComponent<RegisterDiscountProps> = ({
  domain,
  durationInDays,
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
  const [displayedCurrency, setDisplayedCurrency] = useState<CurrencyType>(
    CurrencyType.ETH
  );
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const [salt, setSalt] = useState<string | undefined>();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const encodedDomain = utils
    .encodeDomain(domain)
    .map((element) => element.toString())[0];
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [renewalBox, setRenewalBox] = useState<boolean>(false);
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
  const needsAllowance = useAllowanceCheck(displayedCurrency, address);
  const tokenBalances = useBalances(address); // fetch the user balances for all whitelisted tokens
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

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
      if (displayedCurrency === CurrencyType.ETH) return;
      getTokenQuote(ERC20Contract[displayedCurrency]).then((data) => {
        setQuoteData(data);
      });
    };

    const scheduleRefetch = () => {
      const now = parseInt((new Date().getTime() / 1000).toFixed(0));
      const timeLimit = now - 60; // 60 seconds
      // Check if we need to refetch
      if (!quoteData || displayedCurrency === CurrencyType.ETH) {
        setQuoteData(null);
        // we don't need to check for quote until displayedCurrency is updated
        return;
      }

      if (quoteData.max_quote_validity <= timeLimit) {
        fetchQuote();
      }

      // Calculate the time until the next validity check
      const timeUntilNextCheck = quoteData.max_quote_validity - timeLimit;
      setTimeout(scheduleRefetch, Math.max(15000, timeUntilNextCheck * 100));
    };

    // Initial fetch
    fetchQuote();
    // Start the refetch scheduling
    scheduleRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedCurrency, price]); // We don't add quoteData because it would create an infinite loop

  // we ensure user has enough balance of the token selected
  useEffect(() => {
    if (tokenBalances && price && displayedCurrency) {
      const tokenBalance = tokenBalances[displayedCurrency];
      if (tokenBalance && BigInt(tokenBalance) >= BigInt(price)) {
        setInvalidBalance(false);
      } else {
        setInvalidBalance(true);
      }
    }
  }, [price, displayedCurrency, tokenBalances]);

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
    if (displayedCurrency !== CurrencyType.ETH && !quoteData) return;
    // Variables
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const txMetadataHash = ("0x" + metadataHash) as HexString;
    const addressesMatch =
      hexToDecimal(address) === hexToDecimal(targetAddress);

    // Common calls
    const calls = [
      registrationCalls.approve(price, ERC20Contract[displayedCurrency]),
      registrationCalls.mint(newTokenId),
    ];

    if (displayedCurrency === CurrencyType.ETH) {
      calls.push(
        registrationCalls.buy(
          encodedDomain,
          newTokenId,
          "0",
          durationInDays,
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
          durationInDays,
          txMetadataHash,
          ERC20Contract[displayedCurrency],
          quoteData as QuoteQueryData,
          discountId
        )
      );
    }

    // If the user is a Swiss resident, we add the sales tax
    if (salesTaxRate) {
      calls.unshift(
        registrationCalls.vatTransfer(
          salesTaxAmount,
          ERC20Contract[displayedCurrency]
        )
      ); // IMPORTANT: We use unshift to put the call at the beginning of the array
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
            ERC20Contract[displayedCurrency],
            AutoRenewalContracts[displayedCurrency],
            String(getDomainPriceWei(365, domain))
          )
        );
      }

      const allowance = getAutoRenewAllowance(
        displayedCurrency,
        salesTaxRate,
        BigInt(price)
      );
      calls.push(
        autoRenewalCalls.enableRenewal(
          AutoRenewalContracts[displayedCurrency],
          encodedDomain,
          allowance.toString(),
          txMetadataHash
        )
      );
    }

    // Merge and set the call data
    setCallData(calls);
  }, [
    durationInDays,
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
    displayedCurrency,
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
    if (displayedCurrency === CurrencyType.ETH) {
      setPrice(priceInEth);
    } else if (quoteData) {
      const priceInAltcoin = getDomainPriceAltcoin(
        quoteData.quote,
        BigInt(priceInEth)
      );
      setPrice(priceInAltcoin.toString());
      setLoadingPrice(false);
    }
  }, [priceInEth, quoteData, displayedCurrency]);

  const onCurrencySwitch = (type: CurrencyType) => {
    if (type !== CurrencyType.ETH) setLoadingPrice(true);
    setDisplayedCurrency(type);
  };

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
            dailyPriceInEth={priceInEth}
            dailyPrice={price}
            discountedPrice={price}
            durationInDays={durationInDays}
            renewalBox={false}
            salesTaxRate={salesTaxRate}
            isSwissResident={isSwissResident}
            displayedCurrency={displayedCurrency}
            onCurrencySwitch={onCurrencySwitch}
            customMessage={customMessage}
            loadingPrice={loadingPrice}
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
                !durationInDays ||
                !targetAddress ||
                invalidBalance ||
                !termsBox ||
                emailError
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : invalidBalance
                ? `You don't have enough ${displayedCurrency}`
                : emailError
                ? "Enter a valid Email"
                : "Register my domain"}
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
      <img className={styles.image} src="/visuals/register.webp" />
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
