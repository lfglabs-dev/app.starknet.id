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
import AutoRenewalDomainsBox from "./autoRenewalDomainsBox";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import BackButton from "../UI/backButton";
import { useRouter } from "next/router";
import { useNotificationManager } from "../../hooks/useNotificationManager";
import {
  AutoRenewalContracts,
  CurrenciesType,
  ERC20Contract,
  NotificationType,
  TransactionType,
  swissVatRate,
} from "../../utils/constants";
import RegisterCheckboxes from "../domains/registerCheckboxes";
import { utils } from "starknetid.js";
import RegisterConfirmationModal from "../UI/registerConfirmationModal";
import useAllowanceCheck from "../../hooks/useAllowanceCheck";
import ConnectButton from "../UI/connectButton";
import {
  getAutoRenewAllowance,
  getDomainPrice,
  getDomainPriceAltcoin,
  getTokenQuote,
} from "../../utils/altcoinService";
import CurrencyDropdown from "./currencyDropdown";

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
  const [price, setPrice] = useState<string>(""); // price in altcoin
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null); // null if in ETH
  const [currencyDisplayed, setCurrencyDisplayed] = useState<CurrenciesType>(
    CurrenciesType.ETH
  );
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
  const needsAllowance = useAllowanceCheck(currencyDisplayed, address);

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
  setTimeout(() => {
    if (!quoteData || currencyDisplayed === CurrenciesType.ETH) return;
    if (quoteData.max_quote_validity >= new Date().getTime()) {
      getTokenQuote(ERC20Contract[currencyDisplayed]).then((data) => {
        setQuoteData(data);
      });
    }
  }, 15000);

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
    if (currencyDisplayed === CurrenciesType.ETH) {
      setPrice(priceInEth);
    } else if (quoteData) {
      const priceInAltcoin = getDomainPriceAltcoin(quoteData.quote, priceInEth);
      setPrice(priceInAltcoin);
    }
  }, [priceInEth, quoteData]);

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

  useEffect(() => {
    if (currencyDisplayed !== CurrenciesType.ETH && !quoteData) return;
    if (selectedDomains && metadataHash) {
      const calls = [];

      if (needsAllowance) {
        calls.push(
          autoRenewalCalls.approve(
            ERC20Contract[currencyDisplayed],
            AutoRenewalContracts[currencyDisplayed]
          )
        );
      }

      selectedDomainsToArray(selectedDomains).map((domain) => {
        const encodedDomain = utils
          .encodeDomain(domain)
          .map((element) => element.toString())[0];

        const domainPrice = getDomainPrice(
          domain,
          currencyDisplayed,
          quoteData?.quote
        );
        const allowance = getAutoRenewAllowance(
          currencyDisplayed,
          salesTaxRate,
          domainPrice
        );

        calls.push(
          autoRenewalCalls.enableRenewal(
            AutoRenewalContracts[currencyDisplayed],
            encodedDomain,
            allowance,
            "0x" + metadataHash
          )
        );
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
    currencyDisplayed,
    quoteData,
  ]);

  function changeEmail(value: string): void {
    setEmail(value);
    setEmailError(isValidEmail(value) ? false : true);
  }

  const onCurrencySwitch = (currency: CurrenciesType) => {
    // update currencyDisplayed
    setCurrencyDisplayed(currency);
    // get quote from server
    if (currency === CurrenciesType.ETH) {
      setQuoteData(null);
      setPrice(priceInEth);
    } else {
      getTokenQuote(ERC20Contract[currency]).then((data) => {
        setQuoteData(data);
      });
    }
  };

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
              helperText="Check the box of the domains you want to renew"
              setSelectedDomains={setSelectedDomains}
              selectedDomains={selectedDomains}
            />
          </div>
        </div>
        <div className={styles.summary}>
          <p className={styles.legend}>Your subscription currency</p>
          <CurrencyDropdown
            onCurrencySwitch={onCurrencySwitch}
            currencyDisplayed={currencyDisplayed}
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
                ? "Select a domain to renew"
                : needMedadata && emailError
                ? "Enter a valid Email"
                : "Enable subscription"}
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
      <img className={styles.image} src="/visuals/registerV2.webp" />
      <RegisterConfirmationModal
        txHash={autorenewData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => window.history.back()}
      />
    </div>
  );
};

export default Subscription;
