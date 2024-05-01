/* eslint-disable no-undef */
import {
  getDomainPriceAltcoin,
  getLimitPriceRange,
  getRenewalPriceETH,
  getDomainPrice,
  getAutoRenewAllowance,
  getPriceForDuration,
  fetchAvnuQuoteData,
  smartCurrencyChoosing,
} from "../../utils/altcoinService";
import { PRICES } from "../../utils/priceService";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

const CurrencyType = {
  ETH: "ETH",
  STRK: "STRK",
};

describe("getDomainPriceAltcoin function", () => {
  it("should correctly calculate domain price in altcoin for valid inputs", () => {
    // priceInEth is in wei (1e18 wei = 1 ETH) and quote is the number of altcoin per ETH
    expect(getDomainPriceAltcoin("100", "5000000000000000000")).toBe("500"); // 5 ETH to altcoin at a 1:100 rate
    expect(getDomainPriceAltcoin("50", "10000000000000000000")).toBe("500"); // 10 ETH to altcoin at a 1:50 rate
    expect(getDomainPriceAltcoin("200", "2500000000000000000")).toBe("500"); // 2.5 ETH to altcoin at a 1:200 rate
  });

  it("should handle edge cases gracefully", () => {
    expect(getDomainPriceAltcoin("0", "1000000000000000000")).toBe("0"); // Zero rate
    expect(getDomainPriceAltcoin("100", "0")).toBe("0"); // Zero priceInEth
    expect(getDomainPriceAltcoin("1", "1000000000000000000")).toBe(
      "1000000000000000000"
    ); // 1:1 rate
  });

  it("should return a rounded value to nearest altcoin", () => {
    expect(getDomainPriceAltcoin("100", "5500000000000000000")).toBe("550"); // 5.5 ETH at a 1:100 rate, rounded
    expect(getDomainPriceAltcoin("150", "3333333333333333333")).toBe("500"); // 3.333... ETH at a 1:150 rate, rounded
  });
});

describe("getLimitPriceRange function", () => {
  it("should return the same price for ETH type", () => {
    expect(getLimitPriceRange(CurrencyType.ETH, BigInt(1000))).toBe(
      BigInt(1000)
    );
  });

  it("should increase the price by 30% for STRK type", () => {
    const initialPrice = BigInt(1000);
    const expectedIncrease = BigInt(1000); // 100% of 1000
    const expectedPrice = initialPrice + expectedIncrease;
    expect(getLimitPriceRange(CurrencyType.STRK, initialPrice)).toBe(
      expectedPrice
    );
  });

  // todo: uncomment when USDC and USDT are added
  /*
    it("should increase the price by 10% for USDC type", () => {
      const initialPrice = BigInt(1000);
      const expectedIncrease = BigInt(100); // 10% of 1000
      const expectedPrice = initialPrice + expectedIncrease;
      expect(getLimitPriceRange(CurrencyType.USDC, initialPrice)).toBe(expectedPrice);
    });
  
    it("should increase the price by 10% for USDT type", () => {
      const initialPrice = BigInt(1000);
      const expectedIncrease = BigInt(100); // 10% of 1000
      const expectedPrice = initialPrice + expectedIncrease;
      expect(getLimitPriceRange(CurrencyType.USDT, initialPrice)).toBe(expectedPrice);
    });
    */

  it("should return the original price for undefined types", () => {
    const initialPrice = BigInt(1000);
    expect(getLimitPriceRange("UNKNOWN", initialPrice)).toBe(initialPrice);
  });

  it("should handle large numbers accurately", () => {
    const largePrice = BigInt("1000000000000000000"); // 1e18
    const expectedIncrease = BigInt("1000000000000000000"); // 100% of 1e18 for STRK
    const expectedPrice = largePrice + expectedIncrease;
    expect(getLimitPriceRange(CurrencyType.STRK, largePrice)).toBe(
      expectedPrice
    );
  });
});

describe("getRenewalPriceETH", () => {
  it("returns a fallback price for error in price data", () => {
    const error = new Error("Failed to fetch price");
    const domainPrice = PRICES.FIVE.toString();
    const result = getRenewalPriceETH(error, undefined, "example.com", 1);

    expect(result).toEqual(domainPrice);
  });

  it("returns a fallback price for undefined price data", () => {
    const domainPrice = PRICES.FIVE.toString();
    const result = getRenewalPriceETH(null, undefined, "example.com", 1);

    expect(result).toBe(domainPrice);
  });

  it("calculates renewal price correctly from priceData", () => {
    const priceData = {
      price: {
        high: BigInt(0),
        low: BigInt(26999999999999990),
      },
    };
    const duration = 2;
    const expectedHighPart = priceData.price.high << BigInt(128);
    const totalPrice = expectedHighPart + priceData.price.low;
    const expectedRenewalPrice = totalPrice / BigInt(duration);

    const result = getRenewalPriceETH(null, priceData, "example.com", duration);

    expect(result).toBe(expectedRenewalPrice.toString(10));
  });
});

describe("getDomainPrice", () => {
  it("returns price in ETH when currency type is ETH", () => {
    const domainPrice = PRICES.FIVE.toString();
    const result = getDomainPrice("example.com", CurrencyType.ETH);

    expect(result).toBe(domainPrice);
  });

  it("returns price in alternative currency when currency type is not ETH", () => {
    // price of 1 ETH in STRK
    const quote = "1644663352891940798464";
    const domainPriceInETH = PRICES.FIVE.toString();
    const domainPriceSTRK = getDomainPriceAltcoin(domainPriceInETH, quote);

    const result = getDomainPrice("example.com", CurrencyType.STRK, quote);
    expect(result).toBe(domainPriceSTRK);
  });

  it("throws an error when quote is missing for non-ETH currency type", () => {
    expect(() => {
      getDomainPrice("example.com", CurrencyType.STRK);
    }).toThrow("[big.js] Invalid number");
  });
});

describe("getAutoRenewAllowance", () => {
  it("calculates allowance without sales tax when salesTaxRate is 0", () => {
    const currencyType = CurrencyType.ETH;
    const salesTaxRate = 0;
    const domainPrice = PRICES.FIVE.toString();

    const result = getAutoRenewAllowance(
      currencyType,
      salesTaxRate,
      domainPrice
    );

    expect(result).toBe(domainPrice);
  });

  it("calculates allowance with sales tax when salesTaxRate is provided", () => {
    const currencyType = CurrencyType.ETH;
    const salesTaxRate = 0.1; // 10%
    const domainPrice = "1000000000000000000"; // 1 ETH
    const limitPrice = BigInt(domainPrice);
    const taxAmount = BigInt("100000000000000000"); // 0.1 ETH

    const expectedAllowance = limitPrice + taxAmount; // 1.1 ETH

    const result = getAutoRenewAllowance(
      currencyType,
      salesTaxRate,
      domainPrice
    );

    expect(result).toBe(expectedAllowance.toString());
  });
});

describe("getPriceForDuration function", () => {
  it("should correctly calculate domain price for valid inputs", () => {
    expect(getPriceForDuration("1000000000000000000", 5)).toBe(
      "5000000000000000000"
    ); // 1 ETH for 5 years
    expect(getPriceForDuration("500000000000000000", 10)).toBe(
      "5000000000000000000"
    ); // 0.5 ETH for 10 years
    expect(getPriceForDuration("2000000000000000000", 2)).toBe(
      "4000000000000000000"
    ); // 2 ETH for 2 years
  });

  it("should handle edge cases gracefully", () => {
    expect(getPriceForDuration("0", 10)).toBe("0"); // Zero priceFor1Y
    expect(getPriceForDuration("1000000000000000000", 1)).toBe(
      "1000000000000000000"
    ); // Duration is 1
    expect(getPriceForDuration("0", 0)).toBe("0"); // Zero priceFor1Y and zero duration
  });

  it("should return a rounded value correctly", () => {
    expect(getPriceForDuration("1234567890000000000", 3)).toBe(
      "3703703670000000000"
    );
    expect(getPriceForDuration("1234567890000000000", 4)).toBe(
      "4938271560000000000"
    );
  });
});

describe("fetchAvnuQuoteData function", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it("fetches data successfully and returns the correct structure", async () => {
    const mockData = [
      { address: "0xExample1", currentPrice: 100, decimals: 18 },
      { address: "0xExample2", currentPrice: 200, decimals: 18 },
    ];
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });

    const data = await fetchAvnuQuoteData();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_AVNU_API}/tokens/short?in=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
    );
    expect(data).toEqual(mockData);
  });

  it("handles non-200 responses", async () => {
    fetch.mockReject(new Error("Failed to fetch"));

    await expect(fetchAvnuQuoteData()).rejects.toThrow("Failed to fetch");
  });

  it("handles malformed JSON responses", async () => {
    fetch.mockResponseOnce("not json");

    await expect(fetchAvnuQuoteData()).rejects.toMatchObject({
      name: "FetchError",
      message: expect.stringContaining("Unexpected token"),
      type: "invalid-json",
    });
  });
});

describe("smartCurrencyChoosing", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it("returns ETH when ETH is present and STRK is not", async () => {
    fetch.mockResolvedValueOnce({
      json: () => {
        return Promise.resolve([]);
      },
    });
    const tokenBalances = { ETH: "100", STRK: undefined };
    const result = await smartCurrencyChoosing(tokenBalances);
    expect(result).toEqual(CurrencyType.ETH);
  });

  it("returns STRK when no ETH balance is present", async () => {
    fetch.mockResolvedValueOnce({
      json: () => {
        return Promise.resolve([]);
      },
    });
    const tokenBalances = { ETH: undefined, STRK: "200" };
    const result = await smartCurrencyChoosing(tokenBalances);
    expect(result).toEqual(CurrencyType.STRK);
  });

  it("chooses STRK when converted STRK balance is greater than ETH balance", async () => {
    fetch.mockResolvedValueOnce({
      json: () => {
        return Promise.resolve([
          {
            address:
              "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            currentPrice: 2,
            decimals: 18,
          },
        ]);
      },
    });
    const tokenBalances = { ETH: "1", STRK: "1000" };
    const result = await smartCurrencyChoosing(tokenBalances);
    expect(result).toEqual(CurrencyType.STRK);
  });

  it("falls back to ETH when no STRK quote data is found", async () => {
    fetch.mockResolvedValueOnce({
      json: () => {
        return Promise.resolve([]);
      },
    });

    const tokenBalances = { ETH: "1", STRK: "500" };
    const result = await smartCurrencyChoosing(tokenBalances);
    expect(result).toEqual(CurrencyType.ETH);
  });

  it("chooses STRK when user has ETH but not enough to pay for domain", async () => {
    fetch.mockResolvedValueOnce({
      json: () => {
        return Promise.resolve([
          {
            address:
              "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            currentPrice: 0.0004222825195146873,
            decimals: 18,
          },
        ]);
      },
    });
    const tokenBalances = {
      ETH: "1000000000000000", // 0.001 ETH
      STRK: "80000000000000000000", // 80 STRK = 0.034 ETH
    };
    const domainPrice = "8999999999999875"; // 0.009 ETH
    const result = await smartCurrencyChoosing(tokenBalances, domainPrice);
    expect(result).toEqual(CurrencyType.STRK);
  });

  it("chooses ETH when user has STRK but not enough to pay for domain", async () => {
    fetch.mockResolvedValueOnce({
      json: () => {
        return Promise.resolve([
          {
            address:
              "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            currentPrice: 0.0004222825195146873,
            decimals: 18,
          },
        ]);
      },
    });
    const tokenBalances = {
      ETH: "100000000000000000", // 0.1 ETH
      STRK: "3000000000000000000", // 3 STRK
    };
    const domainPrice = "8999999999999875"; // 0.009 ETH
    const result = await smartCurrencyChoosing(tokenBalances, domainPrice);
    expect(result).toEqual(CurrencyType.ETH);
  });
});
