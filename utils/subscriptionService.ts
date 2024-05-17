import { CurrencyType, ERC20Contract } from "../utils/constants";
import { hexToDecimal } from "./feltService";

// Processes subscription data to determine if tokens need allowances
export function processSubscriptionData(
  data: SubscriptionInfos
): NeedSubscription {
  const newNeedSubscription: NeedSubscription = {};

  // Iterate over each subscription type (e.g., eth_subscriptions, altcoin_subscriptions)
  Object.keys(data).forEach((key) => {
    const tokenNeedsAllowance: TokenNeedsAllowance = {};

    // Initialize token needs allowance for each currency type
    Object.values(CurrencyType).forEach((currency) => {
      tokenNeedsAllowance[currency] = false;
    });

    // Process Ethereum-based subscriptions
    data[key]?.eth_subscriptions?.forEach((sub) => {
      const currency = Object.values(CurrencyType).find(
        (currency) => sub.token === ERC20Contract[currency]
      );
      // Set allowance requirement to true if allowance is zero
      if (currency && BigInt(sub.allowance) === BigInt(0)) {
        tokenNeedsAllowance[currency] = true;
      }
    });

    // Process altcoin-based subscriptions
    data[key]?.altcoin_subscriptions?.forEach((sub) => {
      const currency = Object.values(CurrencyType).find(
        (currency) => sub.token === ERC20Contract[currency]
      );
      // Set allowance requirement to true if allowance is zero
      if (currency && BigInt(sub.allowance) === BigInt(0)) {
        tokenNeedsAllowance[currency] = true;
      }
    });

    // Update the subscription needs for the current key
    newNeedSubscription[key] = tokenNeedsAllowance;
  });
  return newNeedSubscription;
}

// Fetches non-subscribed domains and determines their token needs allowances
export function fetchNonSubscribedDomains(
  address: string
): Promise<NeedSubscription> {
  return fetch(
    `${
      process.env.NEXT_PUBLIC_SERVER_LINK
    }/renewal/get_non_subscribed_domains?addr=${hexToDecimal(address)}`
  )
    .then((response) => response.json())
    .then((data: string[]) => {
      const newNeedSubscription: NeedSubscription = {};

      // Iterate over each non-subscribed domain
      data.forEach((domain) => {
        const tokenNeedsAllowance: TokenNeedsAllowance = {};

        // Assume all currencies need allowance for non-subscribed domains
        Object.values(CurrencyType).forEach((currency) => {
          tokenNeedsAllowance[currency] = true;
        });

        // Update the subscription needs for the current domain
        newNeedSubscription[domain] = tokenNeedsAllowance;
      });
      return newNeedSubscription;
    });
}
