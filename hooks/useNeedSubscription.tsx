import { useState, useEffect } from "react";
import { CurrencyType, ERC20Contract } from "../utils/constants";
import { hexToDecimal } from "@/utils/feltService";
export default function useNeedSubscription(
  address?: string
): NeedSubscription {
  const [needSubscription, setNeedSubscription] = useState<NeedSubscription>(
    {}
  );

  useEffect(() => {
    if (address) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/renewal/get_subscription_info?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data: SubscriptionInfos) => {
          const newNeedSubscription: NeedSubscription = {};

          Object.keys(data).forEach((key) => {
            // Initialize the token needs allowance for the current key
            const tokenNeedsAllowance: TokenNeedsAllowance =
              {} as TokenNeedsAllowance;

            // Iterate over all CurrencyType values to initialize tokenNeedsAllowance
            Object.values(CurrencyType).forEach((currency) => {
              tokenNeedsAllowance[currency] = false;
            });

            // Check if any eth_subscriptions need allowance for each currency type
            data[key]?.eth_subscriptions?.forEach((sub) => {
              const currency = Object.values(CurrencyType).find(
                (currency) => sub.token === ERC20Contract[currency]
              );
              if (currency && BigInt(sub.allowance) === BigInt(0)) {
                tokenNeedsAllowance[currency] = true;
              }
            });

            // Check if any altcoin_subscriptions need allowance for each currency type
            data[key]?.altcoin_subscriptions?.forEach((sub) => {
              const currency = Object.values(CurrencyType).find(
                (currency) => sub.token === ERC20Contract[currency]
              );
              if (currency && BigInt(sub.allowance) === BigInt(0)) {
                tokenNeedsAllowance[currency] = true;
              }
            });

            // Update the newNeedSubscription object for the current key with the token needs allowance status
            newNeedSubscription[key] = tokenNeedsAllowance;
          });

          setNeedSubscription(newNeedSubscription);
        });
    }
  }, [address]);

  // New useEffect to get non-subscribed domains
  useEffect(() => {
    if (address) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/renewal/get_non_subscribed_domains?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data: string[]) => {
          // Initialize the newNeedSubscription object for non-subscribed domains
          const newNeedSubscription: NeedSubscription = {};

          // Iterate over the array of non-subscribed domains
          data.forEach((domain) => {
            // Initialize the token needs allowance for each domain
            const tokenNeedsAllowance: TokenNeedsAllowance =
              {} as TokenNeedsAllowance;

            // Iterate over all CurrencyType values to initialize tokenNeedsAllowance
            Object.values(CurrencyType).forEach((currency) => {
              tokenNeedsAllowance[currency] = true; // Set to true because these domains are not subscribed
            });

            // Update the newNeedSubscription object for the current domain with the token needs allowance status
            newNeedSubscription[domain] = tokenNeedsAllowance;
          });

          // Update the state to include non-subscribed domains
          setNeedSubscription((prevState) => ({
            ...prevState,
            ...newNeedSubscription,
          }));
        });
    }
  }, [address]);

  return needSubscription;
}
