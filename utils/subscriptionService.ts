import { isStarkRootDomain } from "./stringService";

export function getNonSubscribedDomains(data: NeedSubscription): string[] {
  const result: string[] = [];
  for (const domain in data) {
    if (Object.values(data[domain]).some((value) => value)) {
      result.push(domain);
    }
  }
  return result;
}

export function fullIdsToDomains(fullIds: FullId[]): string[] {
  return fullIds
    .filter((identity: FullId) => isStarkRootDomain(identity.domain))
    .map((identity: FullId) => identity.domain);
}

export function processSubscriptionData(
  data: SubscriptionInfos
): NeedSubscription {
  const processedData: NeedSubscription = {};
  Object.entries(data).forEach(([domain, subscriptions]) => {
    if (subscriptions.eth_subscriptions === null) {
      processedData[domain] = {
        ETH: { needsAllowance: true, currentAllowance: BigInt(0) },
        STRK: { needsAllowance: true, currentAllowance: BigInt(0) },
      };
    }
  });
  return processedData;
}
