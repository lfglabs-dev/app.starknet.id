import { processSubscriptionData, fetchNonSubscribedDomains } from "../../utils/subscriptionService";
import { ERC20Contract } from "../../utils/constants";
import { hexToDecimal } from "../../utils/feltService";

// Mock the fetch function globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(["tweed.stark", "benjamin.stark"]),
  })
) as jest.Mock;

describe('fetchNonSubscribedDomains function', () => {
  const mockAddress = '0x12345';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch non-subscribed domains and set needs allowance to true', async () => {
    const expectedOutput = {
      "tweed.stark": { ETH: true, STRK: true },
      "benjamin.stark": { ETH: true, STRK: true },
    };

    const result = await fetchNonSubscribedDomains(mockAddress);

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_non_subscribed_domains?addr=${hexToDecimal(mockAddress)}`
    );
    expect(result).toEqual(expectedOutput);
  });
});


describe('processSubscriptionData function', () => {
    const mockSubscriptionInfos = {
      "domain1.stark": {
        eth_subscriptions: [
          { enabled: true, allowance: "0x0", renewer_address: "0xabc", auto_renew_contract: null, token: ERC20Contract.ETH },
        ],
        altcoin_subscriptions: [
          { enabled: true, allowance: "0x0", renewer_address: "0xdef", auto_renew_contract: null, token: ERC20Contract.STRK },
        ],
      },
      "domain2.stark": {
        eth_subscriptions: [
          { enabled: true, allowance: "0x1", renewer_address: "0xghi", auto_renew_contract: null, token: ERC20Contract.ETH },
        ],
        altcoin_subscriptions: [
          { enabled: true, allowance: "0x1", renewer_address: "0xjkl", auto_renew_contract: null, token: ERC20Contract.STRK },
        ],
      },
    };
  
    it('should process subscription data and set the correct needs allowance', () => {
      const expectedOutput = {
        "domain1.stark": { ETH: true, STRK: true },
        "domain2.stark": { ETH: false, STRK: false },
      };
  
      const result = processSubscriptionData(mockSubscriptionInfos);
      expect(result).toEqual(expectedOutput);
    });
  });