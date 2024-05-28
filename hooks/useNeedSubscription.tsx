import { useState, useEffect } from "react";
import { hexToDecimal } from "@/utils/feltService";
import { processSubscriptionData } from "@/utils/subscriptionService";

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

  useEffect(() => {
    if (address) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/renewal/get_subscription_info?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data: SubscriptionInfos) => {
          const processedData = processSubscriptionData(data);
          setNeedSubscription(processedData);
        });
    }
  }, [address]);

  return {
    needSubscription,
    isLoading: !needSubscription,
    noDomainToSubscribe: Object.keys(needSubscription).length === 0,
  };
}
