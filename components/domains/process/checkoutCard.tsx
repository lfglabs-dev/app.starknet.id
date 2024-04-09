import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import styles from "../../../styles/components/registerV3.module.css";
import { FormContext } from "@/context/FormProvider";
import {
  AutoRenewalContracts,
  CurrencyType,
  ERC20Contract,
  FormType,
  swissVatRate,
} from "@/utils/constants";
import {
  useAccount,
  useContractRead,
  useContractWrite,
} from "@starknet-react/core";
import Button from "@/components/UI/button";
import RegisterSummary from "../registerSummary";
import { usePricingContract } from "@/hooks/contracts";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import useAllowanceCheck from "@/hooks/useAllowanceCheck";
import useBalances from "@/hooks/useBalances";
import { Divider } from "@mui/material";
import { Abi, Call } from "starknet";
import {
  getAutoRenewAllowance,
  getDomainPriceAltcoin,
  getRenewalPriceETH,
  getTokenQuote,
} from "@/utils/altcoinService";
import { getPriceFromDomain } from "@/utils/priceService";
import {
  applyRateToBigInt,
  hexToDecimal,
  toUint256,
} from "@/utils/feltService";
import RegisterCheckboxes from "../registerCheckboxes";
import { getDomainWithStark } from "@/utils/stringService";
import {
  RegistrationDiscount,
  registrationDiscount,
} from "@/utils/discounts/registration";
import UpsellCard from "./upsellCard";
import registrationCalls from "@/utils/callData/registrationCalls";
import { utils } from "starknetid.js";
import autoRenewalCalls from "@/utils/callData/autoRenewalCalls";
import { useDomainFromAddress } from "@/hooks/naming";
import identityChangeCalls from "@/utils/callData/identityChangeCalls";

type CheckoutCardProps = {
  type: FormType;
  discount: RegistrationDiscount;
};

const CheckoutCard: FunctionComponent<CheckoutCardProps> = ({
  type,
  discount,
}) => {
  const { account, address } = useAccount();
  const { formState, updateFormState } = useContext(FormContext);
  const [priceInEth, setPriceInEth] = useState<string>(""); // price in ETH for 1 year
  const [price, setPrice] = useState<string>(""); // total price in displayedCurrency, set to priceInEth on first load as ETH is the default currency
  const [renewPrice, setRenewPrice] = useState<string>("");
  const [discountedPrice, setDiscountedPrice] = useState<string>(""); // discounted price in displayedCurrency
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null); // null if in ETH
  const [salesTaxAmount, setSalesTaxAmount] = useState<string>("0");
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const { contract } = usePricingContract();
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [termsBox, setTermsBox] = useState<boolean>(true);
  const hasMainDomain = useDomainFromAddress(address ?? "").domain.endsWith(
    ".stark"
  );
  const [mainDomainBox, setMainDomainBox] = useState<boolean>(true);
  const [sponsor, setSponsor] = useState<string>("0");
  const [displayedCurrency, setDisplayedCurrency] = useState<CurrencyType>(
    CurrencyType.ETH
  );
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  const [hasReverseAddressRecord, setHasReverseAddressRecord] =
    useState<boolean>(false);
  const { addTransaction } = useNotificationManager();
  const needsAllowance = useAllowanceCheck(displayedCurrency, address);
  const tokenBalances = useBalances(address); // fetch the user balances for all whitelisted tokens
  const [callData, setCallData] = useState<Call[]>([]);
  const [tokenIdRedirect, setTokenIdRedirect] = useState<string>("0");
  const { writeAsync: execute, data: registerData } = useContractWrite({
    calls: callData,
  });
  const domain = Object.keys(formState.selectedDomains)[0];
  // Fetch price of domain for a year
  const { data: priceData, error: priceError } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "compute_buy_price",
    args: [domain.length, 365],
  });

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
      setPriceInEth(getPriceFromDomain(1, domain).toString());
    else {
      const high = priceData?.["price"].high << BigInt(128);
      setPriceInEth((priceData?.["price"].low + high).toString(10));
    }
  }, [priceData, priceError, domain]);

  useEffect(() => {
    // update discountedPrice based on isUpselled selected or not
    if (formState.isUpselled) {
      if (displayedCurrency === CurrencyType.ETH) {
        setDiscountedPrice(
          (BigInt(priceInEth) * BigInt(discount.priceDuration)).toString()
        );
      } else if (quoteData) {
        const priceInAltcoin = getDomainPriceAltcoin(
          quoteData?.quote as string,
          (BigInt(priceInEth) * BigInt(discount.priceDuration)).toString()
        );
        setDiscountedPrice(priceInAltcoin);
      }
    } else setDiscountedPrice("");
  }, [priceInEth, formState.isUpselled, displayedCurrency, quoteData]);

  useEffect(() => {
    const renewalPrice = getRenewalPriceETH(
      priceError,
      priceData,
      domain,
      formState.duration
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
    formState.duration,
    displayedCurrency,
  ]);

  // we ensure user has enough balance of the token selected
  useEffect(() => {
    if (tokenBalances && price && displayedCurrency) {
      const tokenBalance = tokenBalances[displayedCurrency];
      const _price = formState.isUpselled ? discountedPrice : price;
      if (tokenBalance && BigInt(tokenBalance) >= BigInt(_price)) {
        setInvalidBalance(false);
      } else {
        setInvalidBalance(true);
      }
    }
  }, [
    price,
    discountedPrice,
    formState.isUpselled,
    displayedCurrency,
    tokenBalances,
  ]);

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

  useEffect(() => {
    const _price = formState.isUpselled ? discountedPrice : price;
    if (!formState.needMetadata && _price) {
      setSalesTaxAmount(applyRateToBigInt(_price, formState.salesTaxRate));
    } else {
      if (formState.isSwissResident) {
        updateFormState({ salesTaxRate: swissVatRate });
        setSalesTaxAmount(applyRateToBigInt(_price, swissVatRate));
      } else {
        updateFormState({ salesTaxRate: 0 });
        setSalesTaxAmount("");
      }
    }
  }, [
    formState.isSwissResident,
    price,
    formState.isUpselled,
    discountedPrice,
    formState.needMetadata,
    formState.salesTaxRate,
  ]);

  // if priceInEth or quoteData have changed, we update the price in altcoin
  useEffect(() => {
    const _price = (
      BigInt(priceInEth) *
      BigInt(
        formState.isUpselled ? discount.upsell.duration : formState.duration
      )
    ).toString();
    if (displayedCurrency === CurrencyType.ETH) {
      setPrice(_price);
    } else if (quoteData) {
      const priceInAltcoin = getDomainPriceAltcoin(quoteData.quote, _price);
      setPrice(priceInAltcoin);
      setLoadingPrice(false);
    }
  }, [
    priceInEth,
    quoteData,
    displayedCurrency,
    formState.isUpselled,
    formState.duration,
  ]);

  useEffect(() => {
    if (!address) return;
    fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/addr_has_rev?addr=${address}`)
      .then((response) => response.json())
      .then((reverseAddressData) => {
        setHasReverseAddressRecord(reverseAddressData.has_rev);
      });
  }, [address]);

  // Set Register Multicall
  useEffect(() => {
    if (displayedCurrency !== CurrencyType.ETH && !quoteData) return;
    // Variables
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const txMetadataHash = "0x" + formState.metadataHash;
    const encodedDomain = utils
      .encodeDomain(domain)
      .map((element) => element.toString())[0];
    const finalDuration = formState.isUpselled ? 3 : formState.duration;

    // Common calls
    const calls = [
      registrationCalls.approve(price, ERC20Contract[displayedCurrency]),
    ];

    if (displayedCurrency === CurrencyType.ETH) {
      calls.push(
        registrationCalls.buy(
          encodedDomain,
          formState.tokenId === 0 ? newTokenId : formState.tokenId,
          sponsor,
          finalDuration,
          txMetadataHash
        )
      );
    } else {
      calls.push(
        registrationCalls.altcoinBuy(
          encodedDomain,
          formState.tokenId === 0 ? newTokenId : formState.tokenId,
          sponsor,
          finalDuration,
          txMetadataHash,
          ERC20Contract[displayedCurrency],
          quoteData as QuoteQueryData
        )
      );
    }

    // If the user is a Swiss resident, we add the sales tax
    if (formState.salesTaxRate) {
      calls.unshift(registrationCalls.vatTransfer(salesTaxAmount)); // IMPORTANT: We use unshift to put the call at the beginning of the array
    }

    // If the user choose to mint a new identity
    let tokenIdToUse = formState.tokenId;
    if (formState.tokenId === 0) {
      calls.unshift(registrationCalls.mint(newTokenId)); // IMPORTANT: We use unshift to put the call at the beginning of the array
      tokenIdToUse = newTokenId;
    }
    setTokenIdRedirect(tokenIdToUse.toString());

    // If the user does not have a main domain or has checked the mainDomain box
    if (!hasMainDomain || mainDomainBox) {
      if (hasReverseAddressRecord)
        calls.push(registrationCalls.resetAddrToDomain());
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
        formState.salesTaxRate,
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

    // if the user has selected a profile picture
    if (formState.selectedPfp) {
      const nftData = formState.selectedPfp;
      const nft_id = toUint256(nftData.token_id);
      calls.push(
        identityChangeCalls.updateProfilePicture(
          hexToDecimal(nftData.contract_address),
          nft_id.low,
          nft_id.high,
          tokenIdToUse.toString()
        )
      );
    }

    // Merge and set the call data
    setCallData(calls);
  }, [
    formState.tokenId,
    formState.isUpselled,
    formState.duration,
    price,
    formState.selectedDomains,
    hasMainDomain,
    address,
    sponsor,
    formState.metadataHash,
    formState.salesTaxRate,
    renewalBox,
    mainDomainBox,
    salesTaxAmount,
    needsAllowance,
    quoteData,
    displayedCurrency,
    formState.selectedPfp,
  ]);

  //todo: add the fact of adding the query in tx manager + queries before redirecting to new page

  const onCurrencySwitch = (type: CurrencyType) => {
    if (type !== CurrencyType.ETH) setLoadingPrice(true);
    setDisplayedCurrency(type);
  };

  const onUpsellChoice = (enable: boolean) => {
    updateFormState({ isUpselled: enable });
  };

  // const getDiscountedPrice = (): string => {
  //   if (!formState.isUpselled) return "";
  //   if (displayedCurrency === CurrencyType.ETH) {
  //     return (BigInt(priceInEth) * BigInt(3)).toString();
  //   } else if (quoteData) {
  //     return getDomainPriceAltcoin(
  //       quoteData?.quote as string,
  //       (BigInt(priceInEth) * BigInt(3)).toString()
  //     );
  //   }
  //   return "";
  // };

  return (
    <>
      <UpsellCard
        upsellData={registrationDiscount}
        enabled={formState.isUpselled}
        onUpsellChoice={onUpsellChoice}
      />
      <div className={styles.container}>
        <div className={styles.checkout}>
          <RegisterSummary
            ethRegistrationPrice={priceInEth} // price in ETH for one year
            registrationPrice={price} // registration price in displayedCurrency
            duration={formState.isUpselled ? 2 : formState.duration}
            renewalBox={renewalBox}
            salesTaxRate={formState.salesTaxRate}
            isSwissResident={formState.isSwissResident}
            displayedCurrency={displayedCurrency}
            onCurrencySwitch={onCurrencySwitch}
            loadingPrice={loadingPrice}
            isUpselled={formState.isUpselled}
            discountedPrice={discountedPrice}
            discountedDuration={discount.upsell.duration}
          />
          <Divider className="w-full" />
          <div className={styles.checkoutSummary}>
            <RegisterCheckboxes
              onChangeTermsBox={() => setTermsBox(!termsBox)}
              termsBox={termsBox}
              onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
              renewalBox={renewalBox}
              ethRenewalPrice={renewPrice}
              showMainDomainBox={hasMainDomain}
              mainDomainBox={mainDomainBox}
              onChangeMainDomainBox={() => setMainDomainBox(!mainDomainBox)}
              domain={getDomainWithStark(domain)}
            />
            <div>
              <Button
                onClick={
                  () => console.log("execute tx")
                  // execute().then(() => {
                  //   setDomainsMinting((prev) =>
                  //     new Map(prev).set(encodedDomain.toString(), true)
                  //   );
                  // })
                }
                disabled={
                  !account ||
                  !formState.duration ||
                  formState.duration < 1 ||
                  invalidBalance ||
                  !termsBox
                }
              >
                {!termsBox
                  ? "Please accept terms & policies"
                  : invalidBalance
                  ? `You don't have enough ${displayedCurrency}`
                  : "Purchase"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutCard;
