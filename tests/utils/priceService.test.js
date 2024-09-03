/* eslint-disable no-undef */
import { totalAlphabet } from "../../utils/constants";
import {
  PRICES,
  getDomainPriceWei,
  getManyDomainsPriceWei,
  areDomainSelected,
  getTotalYearlyPrice,
  getYearlyPriceWei,
  getApprovalAmount,
  getDisplayablePrice,
  isApprovalInfinite,
} from "../../utils/priceService";
import { generateString } from "../../utils/stringService";

describe("Should test price service file", () => {
  it("Test getDomainPriceWei functions with different domains", () => {
    let randomString = generateString(0, totalAlphabet);
    expect(getDomainPriceWei(1, randomString.concat(".stark"))).toEqual(
      PRICES.FIVE
    );

    randomString = generateString(1, totalAlphabet);
    expect(getDomainPriceWei(1, randomString.concat(".stark"))).toEqual(
      PRICES.ONE
    );

    randomString = generateString(2, totalAlphabet);
    expect(getDomainPriceWei(1, randomString.concat(".stark"))).toEqual(
      PRICES.TWO
    );

    randomString = generateString(3, totalAlphabet);
    expect(getDomainPriceWei(1, randomString)).toEqual(PRICES.THREE);

    randomString = generateString(4, totalAlphabet);
    expect(getDomainPriceWei(1, randomString)).toEqual(PRICES.FOUR);

    randomString = generateString(5, totalAlphabet);
    expect(getDomainPriceWei(1, randomString)).toEqual(PRICES.FIVE);

    randomString = generateString(6, totalAlphabet);
    expect(getDomainPriceWei(1, randomString)).toEqual(PRICES.FIVE);
  });
});

describe("getManyDomainsPriceWei function", () => {
  it("should return the total price for given domains and duration", () => {
    const domains = {
      "example.stark": true,
      "test.stark": true,
    };
    const duration = 1;

    const expectedPrice =
      getDomainPriceWei(1, "example.stark") +
      getDomainPriceWei(1, "test.stark");
    expect(getManyDomainsPriceWei(domains, duration)).toEqual(expectedPrice);
  });

  it("should return zero if no domains are provided", () => {
    const domains = [];
    const duration = 1;

    const expectedPrice = BigInt(0);
    expect(getManyDomainsPriceWei(domains, duration)).toEqual(expectedPrice);
  });

  it("should return the total price for all provided domains", () => {
    const domains = {
      "example.stark": true,
      "qsd.stark": true,
      "q.stark": true,
    };
    const duration = 2;

    const expectedPrice =
      getDomainPriceWei(2, "example.stark") +
      getDomainPriceWei(2, "qsd") +
      getDomainPriceWei(2, "q.stark");
    expect(getManyDomainsPriceWei(domains, duration)).toEqual(expectedPrice);
  });
});

describe("areDomainSelected function", () => {
  it("should return true if at least one domain is selected", () => {
    const input1 = {
      "example.com": true,
      "test.com": false,
      "sample.com": false,
    };
    expect(areDomainSelected(input1)).toBe(true);

    const input2 = {
      "example.com": false,
      "test.com": true,
      "sample.com": false,
    };
    expect(areDomainSelected(input2)).toBe(true);
  });

  it("should return false if no domains are selected", () => {
    const input = {
      "example.com": false,
      "test.com": false,
      "sample.com": false,
    };
    expect(areDomainSelected(input)).toBe(false);
  });

  it("should return true if all domains are selected", () => {
    const input = {
      "example.com": true,
      "test.com": true,
      "sample.com": true,
    };
    expect(areDomainSelected(input)).toBe(true);
  });

  it("should return false if argument is undefined", () => {
    const input = undefined;
    expect(areDomainSelected(input)).toBe(false);
  });
});

describe("getTotalYearlyPrice function", () => {
  it("should return the total yearly price for selected domains", () => {
    const selectedDomains = {
      "fricoben.stark": true,
      "fricobens.stark": true,
      "lili.stark": false,
      "allerpsg.stark": true,
    };

    const expectedPrice = getManyDomainsPriceWei(selectedDomains, 365);

    expect(getTotalYearlyPrice(selectedDomains)).toEqual(expectedPrice);
  });

  it("should return '0' if no domains are selected", () => {
    const selectedDomains = {
      "fricoben.stark": false,
      "fricobens.stark": false,
      "lili.stark": false,
      "allerpsg.stark": false,
    };

    expect(getTotalYearlyPrice(selectedDomains)).toEqual(BigInt(0));
  });

  it("should return '0' if selectedDomains is undefined", () => {
    expect(getTotalYearlyPrice(undefined)).toEqual(BigInt(0));
  });
});

describe("getYearlyPriceWei function", () => {
  it("should return the yearly price in ETH for a given domain", () => {
    const domain = "example.stark";
    const expectedPrice = getDomainPriceWei(365, domain);
    expect(getYearlyPriceWei(domain)).toEqual(expectedPrice);
  });

  it("should return '0' if the domain is an empty string", () => {
    const domain = "";
    expect(getYearlyPriceWei(domain)).toEqual(BigInt("0"));
  });

  it("should return the yearly price in ETH for another domain", () => {
    const domain = "test.stark";
    const expectedPrice = getDomainPriceWei(365, domain);
    expect(getYearlyPriceWei(domain)).toEqual(expectedPrice);
  });
});

describe("getApprovalAmount function", () => {
  it("should calculate the correct approval amount", () => {
    const price = BigInt(1000);
    const salesTaxAmount = BigInt(100);
    const durationInYears = 2;
    const currentAllowance = BigInt(500);

    const result = getApprovalAmount(
      price,
      salesTaxAmount,
      durationInYears,
      currentAllowance
    );

    const expectedAmount =
      ((BigInt(1000) + BigInt(100)) / BigInt(2)) * BigInt(10) + BigInt(500);
    expect(result).toEqual(expectedAmount);
  });

  it("should handle zero values correctly", () => {
    const price = BigInt(0);
    const salesTaxAmount = BigInt(0);
    const durationInYears = 1;
    const currentAllowance = BigInt(0);

    const result = getApprovalAmount(
      price,
      salesTaxAmount,
      durationInYears,
      currentAllowance
    );

    expect(result).toEqual(BigInt(0));
  });

  it("should calculate correctly for different duration years", () => {
    const price = BigInt(1000);
    const salesTaxAmount = BigInt(100);
    const durationInYears = 5;
    const currentAllowance = BigInt(200);

    const result = getApprovalAmount(
      price,
      salesTaxAmount,
      durationInYears,
      currentAllowance
    );

    const expectedAmount =
      ((BigInt(1000) + BigInt(100)) / BigInt(5)) * BigInt(10) + BigInt(200);
    expect(result).toEqual(expectedAmount);
  });
});

describe("getDisplayablePrice function", () => {
  it("should format price correctly for whole numbers", () => {
    const price = BigInt("1000000000000000000"); // 1 ETH in wei
    expect(getDisplayablePrice(price)).toBe("1.000");
  });

  it("should format price correctly for fractional numbers", () => {
    const price = BigInt("1234567890000000000"); // 1.23456789 ETH in wei
    expect(getDisplayablePrice(price)).toBe("1.235");
  });

  it("should handle small numbers correctly", () => {
    const price = BigInt("1000000000000000"); // 0.001 ETH in wei
    expect(getDisplayablePrice(price)).toBe("0.001");
  });

  it("should handle zero correctly", () => {
    const price = BigInt("0");
    expect(getDisplayablePrice(price)).toBe("0.000");
  });

  it("should handle large numbers correctly", () => {
    const price = BigInt("123456789000000000000000"); // 123,456.789 ETH in wei
    expect(getDisplayablePrice(price)).toBe("123456.789");
  });
});

describe("isApprovalInfinite function", () => {
  it("should return true for values equal to or greater than UINT_128_MAX", () => {
    const UINT_128_MAX = (BigInt(1) << BigInt(128)) - BigInt(1);
    expect(isApprovalInfinite(UINT_128_MAX)).toBe(true);
    expect(isApprovalInfinite(UINT_128_MAX + BigInt(1))).toBe(true);
  });

  it("should return true for UINT_256_MINUS_UINT_128", () => {
    const UINT_256_MINUS_UINT_128 =
      (BigInt(1) << BigInt(256)) - (BigInt(1) << BigInt(128));
    expect(isApprovalInfinite(UINT_256_MINUS_UINT_128)).toBe(true);
  });

  it("should return true for UINT_256_MINUS_UINT_128", () => {
    const UINT_256_MINUS_UINT_128 =
      (BigInt(1) << BigInt(256)) - (BigInt(1) << BigInt(128));
    expect(isApprovalInfinite(UINT_256_MINUS_UINT_128)).toBe(true);
  });

  it("should return false for values less than 10K ETH", () => {
    const THRESHOLD = BigInt(10000) * BigInt(10 ** 18);
    expect(isApprovalInfinite(THRESHOLD - BigInt(1))).toBe(false);
    expect(isApprovalInfinite(THRESHOLD + BigInt(1))).toBe(true);
  });

  it("should handle string inputs", () => {
    const UINT_128_MAX = ((BigInt(1) << BigInt(128)) - BigInt(1)).toString();
    expect(isApprovalInfinite(UINT_128_MAX)).toBe(true);
    expect(isApprovalInfinite("1000000")).toBe(false);
  });

  it("should return false for zero", () => {
    expect(isApprovalInfinite(BigInt(0))).toBe(false);
    expect(isApprovalInfinite("0")).toBe(false);
  });
});
