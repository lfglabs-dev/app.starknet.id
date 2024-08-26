import { useState, useEffect } from "react";
import { hexToDecimal } from "@/utils/feltService";

type UseNeedSubscriptionResult = {
  needSubscription: NeedSubscription;
  isLoading: boolean;
  noDomainToSubscribe: boolean;
};

export default function useNeedSubscription(
  address?: string
): UseNeedSubscriptionResult {
  const [needSubscription, setNeedSubscription] = useState<NeedSubscription>(
    {}
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/renewal/get_subscription_info?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data: SubscriptionInfos) => {
          const processedData: NeedSubscription = {};
          Object.entries(data).forEach(([domain, subscriptions]) => {
            if (subscriptions.eth_subscriptions === null) {
              processedData[domain] = {
                ETH: { needsAllowance: true, currentAllowance: BigInt(0) },
                STRK: { needsAllowance: true, currentAllowance: BigInt(0) },
              };
            }
          });
          setNeedSubscription(processedData);
          setIsLoading(false);
        });
    } else {
      setNeedSubscription({});
      setIsLoading(false);
    }
  }, [address]);

  return {
    needSubscription,
    isLoading,
    noDomainToSubscribe: Object.keys(needSubscription).length === 0,
  };
}
