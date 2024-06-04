import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useAccount, useContractWrite } from "@starknet-react/core";
import {
  formatHexString,
  isValidEmail,
  selectedDomainsToArray,
} from "../../utils/stringService";
import { applyRateToBigInt } from "../../utils/feltService";
import { Call } from "starknet";
import { posthog } from "posthog-js";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import SwissForm from "./swissForm";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";
import {
  areDomainSelected,
  getPriceFromDomains,
} from "../../utils/priceService";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import BackButton from "../UI/backButton";
import { useRouter } from "next/router";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import {
  AutoRenewalContracts,
  CurrencyType,
  ERC20Contract,
  NotificationType,
  TransactionType,
  swissVatRate,
} from "../../utils/constants";
import RegisterCheckboxes from "../domains/registerCheckboxes";
import { utils } from "starknetid.js";
import RegisterConfirmationModal from "../UI/registerConfirmationModal";
import ConnectButton from "../UI/connectButton";
import {
  getAutoRenewAllowance,
  getDomainPrice,
  getDomainPriceAltcoin,
  getTokenQuote,
} from "../../utils/altcoinService";
import ArCurrencyDropdown from "./arCurrencyDropdown";
import { areArraysEqual } from "@/utils/arrayService";
import useNeedsAllowances from "@/hooks/useNeedAllowances";
import useNeedSubscription from "@/hooks/useNeedSubscription";
import AutoRenewalDomainsBox from "./autoRenewalDomainsBox";

type SubscriptionProps = {
  groups: string[];
};

const Subscription: FunctionComponent<SubscriptionProps> = ({ groups }) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isSwissResident, setIsSwissResident] = useState<boolean>(false);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [callData, setCallData] = useState<Call[]>([]);
  const [priceInEth, setPriceInEth] = useState<string>(""); // price in ETH
  const [price, setPrice] = useState<string>(""); // price in displayedCurrencies, set to priceInEth on first load as ETH is the default currency
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null); // null if in ETH
  const [displayedCurrencies, setDisplayedCurrencies] = useState<
    CurrencyType[]
  >([CurrencyType.ETH, CurrencyType.STRK]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [needMedadata, setNeedMetadata] = useState<boolean>(true);
  const [selectedDomains, setSelectedDomains] =
    useState<Record<string, boolean>>();
  const { address } = useAccount();
  const { writeAsync: execute, data: autorenewData } = useContractWrite({
    calls: callData,
  });
  const [domainsMinting, setDomainsMinting] =
    useState<Record<string, boolean>>();
  const { addTransaction } = useNotificationManager();
  const router = useRouter();
  const duration = 1;
  const needsAllowance = useNeedsAllowances(address);
  const { needSubscription, isLoading: needSubscriptionLoading } =
    useNeedSubscription(address);

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

  useEffect(() => {
    if (!autorenewData?.transaction_hash || !salt || !metadataHash) return;
    posthog?.capture("enable-ar");

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
        .catch((error) => {
          console.log("Error on sending metadata:", error);
        });
    }

    // Subscribe to auto renewal mailing list if renewal box is checked
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
      subtext: "Domain subscription",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.ENABLE_AUTORENEW,
        hash: autorenewData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorenewData]); // We only need renewData here because we don't want to send the metadata twice (we send it once the tx is sent)

  // on first load, we generate a salt
  useEffect(() => {
    if (!selectedDomains) return;

    setSalt(generateSalt());
  }, [selectedDomains]);

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
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [
      CurrencyType.ETH,
    ]);
    const contractToQuote =
      displayedCurrencies.length > 1
        ? ERC20Contract.STRK
        : ERC20Contract[displayedCurrencies[0]];

    const fetchQuote = () => {
      if (isCurrencyETH || !contractToQuote) return;

      getTokenQuote(contractToQuote).then((data) => {
        setQuoteData(data);
      });
    };

    const scheduleRefetch = () => {
      const now = parseInt((new Date().getTime() / 1000).toFixed(0));
      const timeLimit = now - 60; // 60 seconds
      // Check if we need to refetch
      if (!quoteData || isCurrencyETH) {
        setQuoteData(null);
        // we don't need to check for quote until displayedCurrencies is updated
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
  }, [displayedCurrencies, price]); // We don't add quoteData because it would create an infinite loop

  // if selectedDomains or duration have changed, we update priceInEth
  useEffect(() => {
    if (!selectedDomains) return;
    setPriceInEth(
      getPriceFromDomains(
        selectedDomainsToArray(selectedDomains),
        duration
      ).toString()
    );
  }, [selectedDomains, duration]);

  // if priceInEth or quoteData have changed, we update the price in altcoin
  useEffect(() => {
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [
      CurrencyType.ETH,
    ]);
    if (isCurrencyETH) {
      setPrice(priceInEth);
    } else if (quoteData && priceInEth) {
      const priceInAltcoin = getDomainPriceAltcoin(quoteData.quote, priceInEth);
      setPrice(priceInAltcoin);
    }
  }, [priceInEth, quoteData, displayedCurrencies]);

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

  // Build the autorenewal call
  useEffect(() => {
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [
      CurrencyType.ETH,
    ]);
    if (!isCurrencyETH && !quoteData) return;
    if (selectedDomains && metadataHash) {
      const calls: Call[] = [];

      displayedCurrencies.map((currency) => {
        // Add ERC20 allowance for all currencies if needed
        if (needsAllowance[currency]) {
          const priceToApprove =
            currency === CurrencyType.ETH ? priceInEth : price;

          calls.push(
            autoRenewalCalls.approve(
              ERC20Contract[currency],
              AutoRenewalContracts[currency],
              priceToApprove
            )
          );
        }

        // Add AutoRenewal calls for all currencies
        selectedDomainsToArray(selectedDomains).map((domain) => {
          if (needSubscription && needSubscription[domain]?.[currency]) {
            const encodedDomain = utils
              .encodeDomain(domain)
              .map((element) => element.toString())[0];

            const domainPrice = getDomainPrice(
              domain,
              currency,
              quoteData?.quote
            );
            const allowance = getAutoRenewAllowance(
              currency,
              salesTaxRate,
              domainPrice
            );

            calls.push(
              autoRenewalCalls.enableRenewal(
                AutoRenewalContracts[currency],
                encodedDomain,
                allowance,
                `0x${metadataHash}`
              )
            );
          }
        });
      });
      setCallData(calls);
    }
  }, [
    selectedDomains,
    price,
    salesTaxAmount,
    needsAllowance,
    metadataHash,
    salesTaxRate,
    displayedCurrencies,
    quoteData,
    needSubscription,
  ]);

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <BackButton onClick={() => router.back()} />
          <div className="flex flex-col items-start gap-0 self-stretch">
            <h3 className={styles.domain}>Enable subscription</h3>
            <p className="py-2 text-left">
              Enable subscription to ensure uninterrupted ownership and
              benefits. Never worry about expiration dates again.
            </p>
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
                errorMessage="Please enter a valid email address"
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
            <AutoRenewalDomainsBox
              needSubscription={needSubscription}
              isLoading={needSubscriptionLoading}
              helperText="Check the box of the domains you want to subscribe"
              setSelectedDomains={setSelectedDomains}
              selectedDomains={selectedDomains}
            />
          </div>
        </div>
        <div className={styles.summary}>
          <p className={styles.legend}>Your subscription currency</p>
          <ArCurrencyDropdown
            displayedCurrency={displayedCurrencies as CurrencyType[]}
            onCurrencySwitch={
              setDisplayedCurrencies as (type: CurrencyType[]) => void
            }
          />
          <RegisterCheckboxes
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            renewalBox={false}
            isArOnforced={true}
          />
          {address ? (
            <Button
              onClick={() =>
                execute().then(() => {
                  setDomainsMinting(selectedDomains);
                })
              }
              disabled={
                domainsMinting === selectedDomains ||
                !address ||
                !termsBox ||
                (needMedadata && emailError) ||
                !areDomainSelected(selectedDomains)
              }
            >
              {!termsBox
                ? "Please accept terms & policies"
                : !areDomainSelected(selectedDomains)
                ? "Select a domain to subscribe"
                : needMedadata && emailError
                ? "Enter a valid Email"
                : "Enable subscription"}
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
      <img className={styles.image} src="/visuals/register.webp" />
      <RegisterConfirmationModal
        txHash={autorenewData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => window.history.back()}
      />
    </div>
  );
};

export default Subscription;
