import {
  processSubscriptionData,
  getNonSubscribedDomains,
  fullIdsToDomains,
} from "../../utils/subscriptionService";
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

describe("getNonSubscribedDomains function", () => {
  const mockData = {
    "example.stark": { CURRENCY1: true, CURRENCY2: false },
    "example2.stark": { CURRENCY1: true, CURRENCY2: true },
    "example3.stark": { CURRENCY1: false, CURRENCY2: false },
  };

  it("should return an array of domains that have at least one currency set to true", () => {
    const expectedOutput = ["example.stark", "example2.stark"];
    const result = getNonSubscribedDomains(mockData);
    expect(result).toEqual(expectedOutput);
  });

  it("should return an empty array if no domains have currencies set to true", () => {
    const noTrueData = {
      "domain1.stark": { CURRENCY1: false, CURRENCY2: false },
      "domain2.stark": { CURRENCY1: false, CURRENCY2: false },
    };
    const expectedOutput = [];
    const result = getNonSubscribedDomains(noTrueData);
    expect(result).toEqual(expectedOutput);
  });

  it("should return all domains if all have at least one currency set to true", () => {
    const allTrueData = {
      "domain1.stark": { CURRENCY1: true, CURRENCY2: false },
      "domain2.stark": { CURRENCY1: false, CURRENCY2: true },
    };
    const expectedOutput = ["domain1.stark", "domain2.stark"];
    const result = getNonSubscribedDomains(allTrueData);
    expect(result).toEqual(expectedOutput);
  });
});

describe("fullIdsToDomains", () => {
  it("should return an array of domains that are Stark root domains", () => {
    const mockFullIds: FullId[] = [
      { id: "1", domain: "example.stark", domain_expiry: null, pp_url: null },
      { id: "2", domain: "example.com", domain_expiry: null, pp_url: null },
      { id: "3", domain: "another.stark", domain_expiry: null, pp_url: null },
    ];

    const result = fullIdsToDomains(mockFullIds);
    expect(result).toEqual(["example.stark", "another.stark"]);
  });

  it("should return an empty array if no domains are Stark root domains", () => {
    const mockFullIds: FullId[] = [
      { id: "1", domain: "example.com", domain_expiry: null, pp_url: null },
      { id: "2", domain: "another.com", domain_expiry: null, pp_url: null },
    ];

    const result = fullIdsToDomains(mockFullIds);
    expect(result).toEqual([]);
  });

  it("should handle an empty input array", () => {
    const mockFullIds: FullId[] = [];

    const result = fullIdsToDomains(mockFullIds);
    expect(result).toEqual([]);
  });
});
