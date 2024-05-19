import { processSubscriptionData } from "../../utils/subscriptionService";
import { ERC20Contract } from "../../utils/constants";

describe("processSubscriptionData function", () => {
  const mockSubscriptionInfos = {
    "domain1.stark": {
      eth_subscriptions: [
        {
          enabled: true,
          allowance: "0x0",
          renewer_address: "0xabc",
          auto_renew_contract: null,
          token: ERC20Contract.ETH,
        },
      ],
      altcoin_subscriptions: [
        {
          enabled: true,
          allowance: "0x0",
          renewer_address: "0xdef",
          auto_renew_contract: null,
          token: ERC20Contract.STRK,
        },
      ],
    },
    "domain2.stark": {
      eth_subscriptions: [
        {
          enabled: true,
          allowance: "0x1",
          renewer_address: "0xghi",
          auto_renew_contract: null,
          token: ERC20Contract.ETH,
        },
      ],
      altcoin_subscriptions: [
        {
          enabled: true,
          allowance: "0x1",
          renewer_address: "0xjkl",
          auto_renew_contract: null,
          token: ERC20Contract.STRK,
        },
      ],
    },
    "domain3.stark": {
      eth_subscriptions: null,
      altcoin_subscriptions: null,
    },
  };

  it("should process subscription data and set the correct needs allowance", () => {
    const expectedOutput = {
      "domain1.stark": { ETH: true, STRK: true },
      "domain2.stark": { ETH: false, STRK: false },
      "domain3.stark": { ETH: true, STRK: true },
    };

    const result = processSubscriptionData(mockSubscriptionInfos);
    expect(result).toEqual(expectedOutput);
  });
});
