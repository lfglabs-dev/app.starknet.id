import React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import Button from "../UI/button";
import { useAccount, useContractWrite } from "@starknet-react/core";
import {
  formatHexString,
  isValidEmail,
  selectedDomainsToArray,
  selectedDomainsToEncodedArray,
} from "../../utils/stringService";
import {
  applyRateToBigInt,
  numberToFixedString,
} from "../../utils/feltService";
import { Call } from "starknet";
import styles from "../../styles/components/registerV2.module.css";
import TextField from "../UI/textField";
import SwissForm from "../domains/swissForm";
import { Divider } from "@mui/material";
import RegisterSummary from "../domains/registerSummary";
import { computeMetadataHash, generateSalt } from "../../utils/userDataService";
import {
  areDomainSelected,
  getTotalYearlyPrice,
} from "../../utils/priceService";
import RenewalDomainsBox from "../domains/renewalDomainsBox";
import registrationCalls from "../../utils/callData/registrationCalls";
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
import useNeedsAllowances from "../../hooks/useNeedAllowances";
import ConnectButton from "../UI/connectButton";
import {
  getAutoRenewAllowance,
  getDomainPrice,
  getDomainPriceAltcoin,
  getTokenQuote,
} from "../../utils/altcoinService";
import { areArraysEqual } from "@/utils/arrayService";
import useNeedSubscription from "@/hooks/useNeedSubscription";

type FreeRenewalCheckoutProps = {
  groups: string[];
  goBack: () => void;
  duration: number;
  discountId: string;
  customMessage: string;
  priceInEth: string;
  renewPrice: string;
};

const FreeRenewalCheckout: FunctionComponent<FreeRenewalCheckoutProps> = ({
  groups,
  priceInEth,
  renewPrice,
  duration,
  discountId,
  customMessage,
  goBack,
}) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [isSwissResident, setIsSwissResident] = useState<boolean>(false);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0);
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [callData, setCallData] = useState<Call[]>([]);
  const [price, setPrice] = useState<string>(priceInEth);
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null); // null if in ETH
  const [displayedCurrencies, setDisplayedCurrencies] = useState<
    CurrencyType[]
  >([CurrencyType.ETH, CurrencyType.STRK]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const [salt, setSalt] = useState<string | undefined>();
  const [metadataHash, setMetadataHash] = useState<string | undefined>();
  const [needMetadata, setNeedMetadata] = useState<boolean>(false);
  const [potentialPrice, setPotentialPrice] = useState<string>("0");
  const [selectedDomains, setSelectedDomains] =
    useState<Record<string, boolean>>();
  const { address } = useAccount();
  const { writeAsync: execute, data: renewData } = useContractWrite({
    calls: callData,
  });
  const [domainsMinting, setDomainsMinting] =
    useState<Record<string, boolean>>();
  const { addTransaction } = useNotificationManager();
  const router = useRouter();
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  const needsAllowances = useNeedsAllowances(address);
  const needSubscription = useNeedSubscription(address);

  useEffect(() => {
    setPotentialPrice(getTotalYearlyPrice(selectedDomains));
  }, [selectedDomains, setPotentialPrice]);

  useEffect(() => {
    if (!renewData?.transaction_hash || !salt || !metadataHash) return;

    if (needMetadata) {
      // register the metadata to the sales manager db
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_hash: metadataHash,
          email: email,
          tax_state: isSwissResident ? "switzerland" : "none",
          salt: salt,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log("Error on sending metadata:", err));
    }

    // Subscribe to auto renewal mailing list if renewal box is checked
    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/mail_subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_hash: formatHexString(renewData.transaction_hash),
        groups,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log("Error on registering to email:", err));

    addTransaction({
      timestamp: Date.now(),
      subtext: "Domain renewal",
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.RENEW_DOMAIN,
        hash: renewData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renewData]); // We only need renewData here because we don't want to send the metadata twice (we send it once the tx is sent)

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

      // TO DO - Create getTokenQuotes get all token quotes in the case of ALL CURRENCIES token type
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

  // on first load, we generate a salt
  useEffect(() => {
    setSalt(generateSalt());
  }, [address]);

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
          data.tax_rate ? setSalesTaxRate(data.tax_rate) : setSalesTaxRate(0);
        } else {
          setNeedMetadata(true);
        }
      })
      .catch((err) => {
        console.log("Error while fetching metadata:", err);
        setNeedMetadata(true);
      });
  }, [address]);

  useEffect(() => {
    // salt must not be empty to preserve privacy
    if (!salt || !needMetadata) return;

    const computeHashes = async () => {
      const hash = await computeMetadataHash(
        email,
        isSwissResident ? "switzerland" : "none",
        salt
      );
      setMetadataHash(hash);
    };

    computeHashes();
  }, [email, salt, isSwissResident, needMetadata]);

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

  // build free renewal call
  useEffect(() => {
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [
      CurrencyType.ETH,
    ]);

    if (!isCurrencyETH && !quoteData) return;
    const txMetadataHash = `0x${metadataHash}` as HexString;
    if (selectedDomains) {
      // Free renewal
      const calls = [
        ...registrationCalls.multiCallFreeRenewals(
          selectedDomainsToEncodedArray(selectedDomains),
          AutoRenewalContracts[displayedCurrencies[0]] // If we have multiple currencies, we use the first one (which is ETH)
        ),
      ];

      displayedCurrencies.map((currency) => {
        // Add ERC20 allowance for all currencies if needed
        if (needsAllowances[currency]) {
          calls.unshift(
            autoRenewalCalls.approve(
              ERC20Contract[currency],
              AutoRenewalContracts[currency]
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

            calls.unshift(
              autoRenewalCalls.enableRenewal(
                AutoRenewalContracts[currency],
                encodedDomain,
                allowance,
                txMetadataHash
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
    needsAllowances,
    metadataHash,
    salesTaxRate,
    duration,
    discountId,
    needMetadata,
    quoteData,
    displayedCurrencies,
    needSubscription,
  ]);

  useEffect(() => {
    const isCurrencyETH = areArraysEqual(displayedCurrencies, [
      CurrencyType.ETH,
    ]);

    if (isCurrencyETH) {
      setPrice(priceInEth);
      setLoadingPrice(false);
    } else if (quoteData) {
      const priceInAltcoin = getDomainPriceAltcoin(quoteData.quote, priceInEth);
      setPrice(priceInAltcoin);
      setLoadingPrice(false);
    }
  }, [priceInEth, quoteData, displayedCurrencies]);

  const onCurrencySwitch = (currency: CurrencyType[]) => {
    setDisplayedCurrencies(currency as CurrencyType[]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.form}>
          <BackButton onClick={goBack} />
          <div className="flex flex-col items-start gap-0 self-stretch">
            <p className={styles.legend}>Your renewal</p>
            <h3 className={styles.domain}>Renew Your domain(s)</h3>
          </div>
          <div className="flex flex-col items-start gap-6 self-stretch">
            {needMetadata && (
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
            )}
            {needMetadata && (
              <SwissForm
                isSwissResident={isSwissResident}
                onSwissResidentChange={() =>
                  setIsSwissResident(!isSwissResident)
                }
              />
            )}

            <RenewalDomainsBox
              helperText="Check the box of the domains you want to renew"
              setSelectedDomains={setSelectedDomains}
              selectedDomains={selectedDomains}
            />
          </div>
        </div>
        <div className={styles.summary}>
          <RegisterSummary
            ethRegistrationPrice={priceInEth}
            registrationPrice={price}
            duration={Number(numberToFixedString(duration / 365))}
            salesTaxRate={salesTaxRate}
            isSwissResident={isSwissResident}
            customMessage={`${customMessage} and then ${potentialPrice} ETH per year`}
            displayedCurrency={displayedCurrencies}
            onCurrencySwitch={onCurrencySwitch}
            loadingPrice={loadingPrice}
            areArCurrenciesEnabled
          />
          <Divider className="w-full" />
          <RegisterCheckboxes
            onChangeTermsBox={() => setTermsBox(!termsBox)}
            termsBox={termsBox}
            isArOnforced={true}
            ethRenewalPrice={renewPrice}
          />
          <div>
            {address ? (
              <Button
                onClick={() => {
                  execute().then(() => {
                    setDomainsMinting(selectedDomains);
                  });
                }}
                disabled={
                  domainsMinting === selectedDomains ||
                  !address ||
                  !termsBox ||
                  (emailError && needMetadata) ||
                  !areDomainSelected(selectedDomains)
                }
              >
                {!termsBox
                  ? "Please accept terms & policies"
                  : !areDomainSelected(selectedDomains)
                  ? "Select a domain to renew"
                  : emailError && needMetadata
                  ? "Enter a valid Email"
                  : "Renew my domain(s)"}
              </Button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
      <img className={styles.image} src="/visuals/register.webp" />
      <RegisterConfirmationModal
        txHash={renewData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => router.push("/identities")}
      />
    </div>
  );
};

export default FreeRenewalCheckout;
