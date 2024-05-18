import { CurrencyType, ERC20Contract } from "../utils/constants";

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
    if (data[key]?.eth_subscriptions) {
      data[key].eth_subscriptions?.forEach((sub) => {
        const currency = Object.values(CurrencyType).find(
          (currency) => sub.token === ERC20Contract[currency]
        );
        // Set allowance requirement to true if allowance is zero
        if (currency && BigInt(sub.allowance) === BigInt(0)) {
          tokenNeedsAllowance[currency] = true;
        }
      });
    } else {
      // Set allowance requirement to true if eth_subscriptions is null (meaning the domain is not subscribed to Ethereum-based subscriptions)
      tokenNeedsAllowance[CurrencyType.ETH] = true;
    }

    // Process altcoin-based subscriptions
    if (data[key]?.altcoin_subscriptions) {
      data[key].altcoin_subscriptions?.forEach((sub) => {
        const currency = Object.values(CurrencyType).find(
          (currency) => sub.token === ERC20Contract[currency]
        );
        // Set allowance requirement to true if allowance is zero
        if (currency && BigInt(sub.allowance) === BigInt(0)) {
          tokenNeedsAllowance[currency] = true;
        }
      });
    } else {
      // Set allowance to all altcoin currencies to true if altcoin_subscriptions is null (meaning the domain is not subscribed to any altcoin-based subscriptions)
      Object.values(CurrencyType).forEach((currency) => {
        if (currency !== CurrencyType.ETH) {
          tokenNeedsAllowance[currency] = true;
        }
      });
    }

    // Update the subscription needs for the current key
    newNeedSubscription[key] = tokenNeedsAllowance;
  });
  return newNeedSubscription;
}
