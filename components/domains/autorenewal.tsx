import React, { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { selectedDomainsToArray } from "../../utils/stringService";
import { applyRateToBigInt } from "../../utils/feltService";
import { Call } from "starknet";
import { posthog } from "posthog-js";
import styles from "../../styles/components/registerV2.module.css";

import SwissForm from "./swissForm";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";
import {
  areDomainSelected,
  getApprovalAmount,
  getTotalYearlyPrice,
} from "../../utils/priceService";
import autoRenewalCalls from "../../utils/callData/autoRenewalCalls";
import CloseIcon from "../UI/iconsComponents/icons/closeIcon";
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
import ConnectButton from "../UI/connectButton";
import {
  getAutoRenewAllowance,
  getDomainPrice,
  getDomainPriceAltcoin,
  getTokenQuote,
} from "../../utils/altcoinService";
import ArCurrencyDropdown from "./arCurrencyDropdown";
import { areArraysEqual } from "@/utils/arrayService";
import useNeedAllowances from "@/hooks/useNeedAllowances";
import useNeedSubscription from "@/hooks/useNeedSubscription";
import AutoRenewalDomainsBox from "./autoRenewalDomainsBox";
import Notification from "../UI/notification";
import RegisterConfirmationModal from "../UI/registerConfirmationModal";

const Subscription: FunctionComponent = () => {
  const [isSwissResident, setIsSwissResident] = useState<boolean>(false);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<bigint>(BigInt(0));
  const [callData, setCallData] = useState<Call[]>([]);
  const [priceInEth, setPriceInEth] = useState<bigint>(BigInt(0));
  const [price, setPrice] = useState<bigint>(BigInt(0));
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null);
  const [displayedCurrencies, setDisplayedCurrencies] = useState<CurrencyType[]>([
    CurrencyType.ETH,
    CurrencyType.STRK,
  ]);
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [needMedadata, setNeedMetadata] = useState<boolean>(true);
  const [selectedDomains, setSelectedDomains] = useState<Record<string, boolean>>();
  const { address } = useAccount();
  const { sendAsync: execute, data: autorenewData } = useSendTransaction({ calls: callData });
  const [domainsMinting, setDomainsMinting] = useState<Record<string, boolean>>();
  const { addTransaction } = useNotificationManager();
  const router = useRouter();
  const allowanceStatus = useNeedAllowances(address);
  const { needSubscription, isLoading: needSubscriptionLoading } = useNeedSubscription(address);
  const [currencyError, setCurrencyError] = useState<boolean>(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);

  const handleCloseClick = () => {
    router.back();
  };

  useEffect(() => {
    if (!address) return;
    fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_metahash?addr=${address}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.meta_hash && parseInt(data.meta_hash) !== 0) {
          setNeedMetadata(false);
          setMetadataHash(data.meta_hash);
          setSalesTaxRate(data.tax_rate || 0);
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

    if (needMedadata) {
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_hash: metadataHash,
          email: "none",
          tax_state: isSwissResident ? "switzerland" : "none",
          salt: salt,
        }),
      }).catch((error) => console.log("Error on sending metadata:", error));
    }

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
    router.push("/subscriptionConfirmation");
  }, [autorenewData]);

  useEffect(() => {
    if (!selectedDomains) return;
    setSalt(generateSalt());
  }, [selectedDomains]);

  useEffect(() => {
    if (!salt || !needMedadata) return;

    (async () => {
      const hash = await computeMetadataHash(
        "none",
        isSwissResident ? "switzerland" : "none",
        salt
      );
      setMetadataHash(hash);
    })();
  }, [salt, isSwissResident, needMedadata]);

  useEffect(() => {
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [CurrencyType.ETH]);
    const contractToQuote =
      displayedCurrencies.length > 1
        ? ERC20Contract.STRK
        : ERC20Contract[displayedCurrencies[0]];

    const fetchQuote = () => {
      if (isCurrencyETH || !contractToQuote) return;

      getTokenQuote(contractToQuote).then((data) => {
        if (data) {
          setQuoteData(data);
          setCurrencyError(false);
        } else {
          setDisplayedCurrencies([CurrencyType.ETH]);
          setCurrencyError(true);
        }
      });
    };

    const scheduleRefetch = () => {
      if (!quoteData || isCurrencyETH) return;
      const now = Math.floor(Date.now() / 1000);
      const timeLimit = now - 60;
      if (quoteData.max_quote_validity <= timeLimit) {
        fetchQuote();
      }
      const timeUntilNextCheck = quoteData.max_quote_validity - timeLimit;
      setTimeout(scheduleRefetch, Math.max(15000, timeUntilNextCheck * 100));
    };

    fetchQuote();
    scheduleRefetch();
  }, [displayedCurrencies, price]);

  useEffect(() => {
    if (!selectedDomains) return;
    setPriceInEth(getTotalYearlyPrice(selectedDomains));
  }, [selectedDomains]);

  useEffect(() => {
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [CurrencyType.ETH]);
    if (isCurrencyETH) {
      setPrice(priceInEth);
    } else if (quoteData && priceInEth) {
      setPrice(getDomainPriceAltcoin(quoteData.quote, priceInEth));
    }
  }, [priceInEth, quoteData, displayedCurrencies]);

  useEffect(() => {
    if (!needMedadata && price) {
      setSalesTaxAmount(applyRateToBigInt(price, salesTaxRate));
    } else {
      const rate = isSwissResident ? swissVatRate : 0;
      setSalesTaxRate(rate);
      setSalesTaxAmount(applyRateToBigInt(price, rate));
    }
  }, [isSwissResident, price, needMedadata]);

  useEffect(() => {
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [CurrencyType.ETH]);
    if (!isCurrencyETH && !quoteData) return;
    if (selectedDomains && metadataHash) {
      const calls: Call[] = [];

      displayedCurrencies.forEach((currency) => {
        if (allowanceStatus[currency].needsAllowance) {
          const amountToApprove = getApprovalAmount(
            price,
            salesTaxAmount,
            1,
            allowanceStatus[currency].currentAllowance
          );

          calls.push(
            autoRenewalCalls.approve(
              ERC20Contract[currency],
              AutoRenewalContracts[currency],
              amountToApprove
            )
          );
        }

        selectedDomainsToArray(selectedDomains).forEach((domain) => {
          if (needSubscription && needSubscription[domain]?.[currency]) {
            const encodedDomain = utils.encodeDomain(domain)[0].toString();
            const domainPrice = getDomainPrice(domain, currency, 365, quoteData?.quote);
            const allowance = getAutoRenewAllowance(currency, salesTaxRate, domainPrice);

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
    allowanceStatus,
    metadataHash,
    salesTaxRate,
    displayedCurrencies,
    quoteData,
    needSubscription,
    priceInEth,
  ]);

  return (
    <div className={styles.card}>
      <div className={styles.form}>
        <div onClick={handleCloseClick} className={styles.closeIcon}>
          <CloseIcon />
        </div>
        <div className="flex flex-col items-start gap-0 self-stretch">
          <h3 className={`${styles.domain} text-center w-full`}>Enable subscription</h3>
          <p className="py-2 text-center font-poppins text-[#8C8989] text-[14px] leading-[24px] tracking-[0%]">
            Enable subscription to ensure uninterrupted ownership and
            benefits. Never worry about expiration dates again.
          </p>
        </div>
        <div className="flex flex-col items-start gap-6 self-stretch">
          {needMedadata && (
            <SwissForm
              isSwissResident={isSwissResident}
              onSwissResidentChange={() => setIsSwissResident(!isSwissResident)}
            />
          )}
          <div className="w-full">
            <AutoRenewalDomainsBox
              needSubscription={needSubscription}
              isLoading={needSubscriptionLoading}
              helperText="Check the box of the domains you want to subscribe"
              setSelectedDomains={setSelectedDomains}
              selectedDomains={selectedDomains}
            />
          </div>
        </div>
      </div>

      <div className="summary flex flex-col items-start gap-6 self-stretch pt-6 px-12 pb-0">
        <div className="gap-1 w-full text-left">
          <p className={styles.legend}>Your subscription currency</p>
          <ArCurrencyDropdown
            displayedCurrency={displayedCurrencies}
            onCurrencySwitch={setDisplayedCurrencies}
          />
        </div>

        <div className="w-full">
          <RegisterCheckboxes
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
            renewalBox={false}
            isArOnforced={true}
          />
        </div>

        <div className="flex justify-center w-full -mt-6">
          {address ? (
            <div className="w-auto">
              <Button
                onClick={() =>
                  execute().then(() => {
                    setDomainsMinting(selectedDomains);
                    setIsTxModalOpen(true);
                  })
                }
                disabled={
                  domainsMinting === selectedDomains ||
                  !address ||
                  !termsBox ||
                  !areDomainSelected(selectedDomains) ||
                  callData.length === 0
                }
              >
                {!termsBox
                  ? "Please accept terms & policies"
                  : !areDomainSelected(selectedDomains)
                  ? "Select a domain to subscribe"
                  : callData.length === 0
                  ? "You're already subscribed"
                  : "Enable subscription"}
              </Button>
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>

      <RegisterConfirmationModal
        txHash={autorenewData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => window.history.back()}
      />

      <Notification visible={currencyError} onClose={() => setCurrencyError(false)}>
        <p>Failed to get token quote. Please use ETH for now.</p>
      </Notification>
    </div>
  );
};

export default Subscription;
