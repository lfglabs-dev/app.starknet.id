import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { usePricingContract } from "../../hooks/contracts";
import {
  useAccount,
  useContractRead,
  useContractWrite,
} from "@starknet-react/core";
import { utils } from "starknetid.js";
import {
  getDomainWithStark,
  formatHexString,
  isValidEmail,
} from "../../utils/stringService";
import { applyRateToBigInt } from "../../utils/feltService";
import SelectIdentity from "./selectIdentity";
import { useDisplayName } from "../../hooks/displayName.tsx";
import { Abi, Call } from "starknet";
import { posthog } from "posthog-js";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import SwissForm from "./swissForm";
import { Divider } from "@mui/material";
import NumberTextField from "../UI/numberTextField";
import RegisterSummary from "./registerSummary";
import registrationCalls from "../../utils/callData/registrationCalls";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";
import { getPriceFromDomain } from "../../utils/priceService";
import RegisterCheckboxes from "./registerCheckboxes";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import RegisterConfirmationModal from "../UI/registerConfirmationModal";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import {
  AutoRenewalContracts,
  ERC20Contract,
  CurrencyType,
  NotificationType,
  TransactionType,
  swissVatRate,
} from "../../utils/constants";
import useAllowanceCheck from "../../hooks/useAllowanceCheck";
import { useRouter } from "next/router";
import ConnectButton from "../UI/connectButton";
import useBalances from "../../hooks/useBalances";
import {
  getAutoRenewAllowance,
  getDomainPriceAltcoin,
  getRenewalPriceETH,
  getTokenQuote,
} from "../../utils/altcoinService";

type RegisterV2Props = {
  domain: string;
  groups: string[];
};

const RegisterV2: FunctionComponent<RegisterV2Props> = ({ domain, groups }) => {
  const router = useRouter();
  const maxYearsToRegister = 25;
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isSwissResident, setIsSwissResident] = useState<boolean>(false);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [duration, setDuration] = useState<number>(1);
  const [tokenId, setTokenId] = useState<number>(0);
  const [callData, setCallData] = useState<Call[]>([]);
  const [priceInEth, setPriceInEth] = useState<string>(""); // price in ETH
  const [price, setPrice] = useState<string>(""); // price in displayedCurrency, set to priceInEth on first load as ETH is the default currency
  const [renewPrice, setRenewPrice] = useState<string>("");
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null); // null if in ETH
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const { contract } = usePricingContract();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const encodedDomain = utils
    .encodeDomain(domain)
    .map((element) => element.toString())[0];
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [sponsor, setSponsor] = useState<string>("0");
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [needMedadata, setNeedMetadata] = useState<boolean>(true);
  const [displayedCurrency, setDisplayedCurrency] = useState<CurrencyType>(
    CurrencyType.ETH
  );
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

  const { data: priceData, error: priceError } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "compute_buy_price",
    args: [domain.length, duration * 365],
  });

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

  // on first load, we generate a salt
  useEffect(() => {
    setSalt(generateSalt());
  }, [domain]); // we only need to generate a salt once per domain

  // we check if the user has already registered metadata
  useEffect(() => {
    if (!address) return;
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_metahash?addr=${address}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.meta_hash && parseInt(data.meta_hash) !== 0) {
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
  }, [address]);

  // we update compute the purchase metadata hash
  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salt || !needMedadata) return;
    (async () => {
      setMetadataHash(
        await computeMetadataHash(
          email,
          isSwissResident ? "switzerland" : "none",
          salt
        )
      );
    })();
  }, [email, salt, renewalBox, isSwissResident, needMedadata]);

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
  }, [displayedCurrency, priceInEth]); // We don't add quoteData because it would create an infinite loop

  useEffect(() => {
    // if price query does not work we use the off-chain hardcoded price
    if (priceError || !priceData)
      setPriceInEth(getPriceFromDomain(duration, domain).toString());
    else {
      const high = priceData?.["price"].high << BigInt(128);
      setPriceInEth((priceData?.["price"].low + high).toString(10));
    }
  }, [priceData, priceError, duration, domain]);

  useEffect(() => {
    const renewalPrice = getRenewalPriceETH(
      priceError,
      priceData,
      domain,
      duration
    );
    if (displayedCurrency === CurrencyType.ETH) {
      setRenewPrice(renewalPrice);
    } else if (quoteData) {
      const priceInAltcoin = getDomainPriceAltcoin(
        quoteData?.quote as string,
        renewalPrice
      );
      setRenewPrice(priceInAltcoin);
    }
  }, [
    priceData,
    priceError,
    domain,
    quoteData?.quote,
    duration,
    displayedCurrency,
  ]);

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
    const referralData = localStorage.getItem("referralData");
    if (referralData) {
      const data = JSON.parse(referralData);
      if (data.sponsor && data?.expiry >= new Date().getTime()) {
        setSponsor(data.sponsor);
      } else {
        setSponsor("0");
      }
    } else {
      setSponsor("0");
    }
  }, [domain]);

  // Set Register Multicall
  useEffect(() => {
    if (displayedCurrency !== CurrencyType.ETH && !quoteData) return;
    // Variables
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const txMetadataHash = "0x" + metadataHash;

    // Common calls
    const calls = [
      registrationCalls.approve(price, ERC20Contract[displayedCurrency]),
    ];

    if (displayedCurrency === CurrencyType.ETH) {
      calls.push(
        registrationCalls.buy(
          encodedDomain,
          tokenId === 0 ? newTokenId : tokenId,
          sponsor,
          duration,
          txMetadataHash
        )
      );
    } else {
      calls.push(
        registrationCalls.altcoinBuy(
          encodedDomain,
          tokenId === 0 ? newTokenId : tokenId,
          sponsor,
          duration,
          txMetadataHash,
          ERC20Contract[displayedCurrency],
          quoteData as QuoteQueryData
        )
      );
    }

    // If the user is a Swiss resident, we add the sales tax
    if (salesTaxRate) {
      calls.unshift(registrationCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
    }

    // If the user choose to mint a new identity
    let tokenIdToUse = tokenId;
    if (tokenId === 0) {
      calls.unshift(registrationCalls.mint(newTokenId)); // IMPORTANT: We use unshift to put the call at the beginning of the array
      tokenIdToUse = newTokenId;
    }

    // If the user do not have a main domain
    if (!hasMainDomain) {
      calls.push(registrationCalls.mainId(tokenIdToUse));
    }

    // If the user has toggled autorenewal
    if (renewalBox) {
      if (needsAllowance) {
        calls.push(
          autoRenewalCalls.approve(
            ERC20Contract[displayedCurrency],
            AutoRenewalContracts[displayedCurrency]
          )
        );
      }

      const allowance = getAutoRenewAllowance(
        displayedCurrency,
        salesTaxRate,
        price
      );
      calls.push(
        autoRenewalCalls.enableRenewal(
          AutoRenewalContracts[displayedCurrency],
          encodedDomain,
          allowance,
          txMetadataHash
        )
      );
    }

    // Merge and set the call data
    setCallData(calls);
  }, [
    tokenId,
    duration,
    price,
    encodedDomain,
    hasMainDomain,
    address,
    sponsor,
    metadataHash,
    salesTaxRate,
    renewalBox,
    salesTaxAmount,
    needsAllowance,
    quoteData,
    displayedCurrency,
  ]);

  useEffect(() => {
    if (!registerData?.transaction_hash || !salt) return;

    // track the registration event(s) for analytics
    if (renewalBox) posthog?.capture("enable-ar-register");
    posthog?.capture("register");

    // register the metadata to the sales manager db
    if (needMedadata) {
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_hash: metadataHash,
          email,
          tax_state: isSwissResident ? "switzerland" : "none",
          salt: salt,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log("Error on sending metadata:", err));
    }

    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/mail_subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_hash: formatHexString(registerData.transaction_hash),
        groups: renewalBox ? groups : [groups[0]],
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log("Error on registering to email:", err));

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
  }, [registerData]); // We only need registerData here because we don't want to send the metadata twice (we send it once the tx is sent)

  useEffect(() => {
    if (!needMedadata && price) {
      setSalesTaxAmount(applyRateToBigInt(price, salesTaxRate));
    } else {
      if (isSwissResident) {
        setSalesTaxRate(swissVatRate);
        setSalesTaxAmount(applyRateToBigInt(price, swissVatRate));
      } else {
        setSalesTaxRate(0);
        setSalesTaxAmount("");
      }
    }
  }, [isSwissResident, price, needMedadata, salesTaxRate]);

  // if priceInEth or quoteData have changed, we update the price in altcoin
  useEffect(() => {
    if (displayedCurrency === CurrencyType.ETH) {
      setPrice(priceInEth);
    } else if (quoteData) {
      const priceInAltcoin = getDomainPriceAltcoin(quoteData.quote, priceInEth);
      setPrice(priceInAltcoin);
      setLoadingPrice(false);
    }
  }, [priceInEth, quoteData, displayedCurrency]);

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
  }

  function changeDuration(value: number): void {
    if (isNaN(value) || value > maxYearsToRegister || value < 1) return;
    setDuration(value);
  }

  function changeTokenId(value: number): void {
    setTokenId(Number(value));
  }

  function closeModal(): void {
    setIsTxModalOpen(false);
    router.push(`/identities`);
  }

  const onCurrencySwitch = (type: CurrencyType) => {
    if (type !== CurrencyType.ETH) setLoadingPrice(true);
    setDisplayedCurrency(type);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <div className="flex flex-col items-start gap-4 self-stretch">
            <p className={styles.legend}>Your registration</p>
            <h3 className={styles.domain}>{getDomainWithStark(domain)}</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            {needMedadata ? (
              <TextField
                helperText="Secure your domain's future and stay ahead with vital updates. Your email stays private with us, always."
                label="Email address"
                value={email}
                onChange={(e) => changeEmail(e.target.value)}
                color="secondary"
                error={emailError}
                errorMessage={"Please enter a valid email address"}
                type="email"
              />
            ) : null}

            {needMedadata ? (
              <SwissForm
                isSwissResident={isSwissResident}
                onSwissResidentChange={() =>
                  setIsSwissResident(!isSwissResident)
                }
              />
            ) : null}
            <SelectIdentity tokenId={tokenId} changeTokenId={changeTokenId} />
            <NumberTextField
              value={duration}
              label="Years to register (max 25 years)"
              placeholder="years"
              onChange={(e) => changeDuration(Number(e.target.value))}
              incrementValue={() =>
                setDuration(
                  duration < maxYearsToRegister ? duration + 1 : duration
                )
              }
              decrementValue={() =>
                setDuration(duration > 1 ? duration - 1 : duration)
              }
              color="secondary"
              required
            />
          </div>
        </div>
        <div className={styles.summary}>
          <RegisterSummary
            ethRegistrationPrice={priceInEth}
            registrationPrice={price}
            duration={duration}
            renewalBox={renewalBox}
            salesTaxRate={salesTaxRate}
            isSwissResident={isSwissResident}
            displayedCurrency={displayedCurrency}
            onCurrencySwitch={onCurrencySwitch}
            loadingPrice={loadingPrice}
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            renewalBox={renewalBox}
            ethRenewalPrice={renewPrice}
          />
          {address ? (
            <Button
              onClick={() =>
                execute().then(() => {
                  setDomainsMinting((prev) =>
                    new Map(prev).set(encodedDomain.toString(), true)
                  );
                })
              }
              disabled={
                (domainsMinting.get(encodedDomain) as boolean) ||
                !account ||
                !duration ||
                duration < 1 ||
                invalidBalance ||
                !termsBox ||
                (needMedadata && emailError)
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : invalidBalance
                ? `You don't have enough ${displayedCurrency}`
                : needMedadata && emailError
                ? "Enter a valid Email"
                : "Register my domain"}
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
      <img className={styles.image} src="/visuals/registerV2.webp" />
      <RegisterConfirmationModal
        txHash={registerData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={closeModal}
      />
    </div>
  );
};

export default RegisterV2;
