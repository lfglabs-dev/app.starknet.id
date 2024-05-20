/* eslint-disable no-undef */
import { totalAlphabet } from "../../utils/constants";
import {
  PRICES,
  getPriceFromDomain,
  getPriceFromDomains,
  areDomainSelected,
  getTotalYearlyPrice,
} from "../../utils/priceService";
import { generateString } from "../../utils/stringService";
import { gweiToEth } from "../../utils/feltService";

describe("Should test price service file", () => {
  it("Test getPriceFromDomain functions with different domains", () => {
    let randomString = generateString(0, totalAlphabet);
    expect(getPriceFromDomain(1, randomString.concat(".stark"))).toEqual(
      PRICES.FIVE
    );

    randomString = generateString(1, totalAlphabet);
    expect(getPriceFromDomain(1, randomString.concat(".stark"))).toEqual(
      PRICES.ONE
    );

    randomString = generateString(2, totalAlphabet);
    expect(getPriceFromDomain(1, randomString.concat(".stark"))).toEqual(
      PRICES.TWO
    );

    randomString = generateString(3, totalAlphabet);
    expect(getPriceFromDomain(1, randomString)).toEqual(PRICES.THREE);

    randomString = generateString(4, totalAlphabet);
    expect(getPriceFromDomain(1, randomString)).toEqual(PRICES.FOUR);

    randomString = generateString(5, totalAlphabet);
    expect(getPriceFromDomain(1, randomString)).toEqual(PRICES.FIVE);

    randomString = generateString(6, totalAlphabet);
    expect(getPriceFromDomain(1, randomString)).toEqual(PRICES.FIVE);
  });
});

describe("getPriceFromDomains function", () => {
  it("should return the total price for given domains and duration", () => {
    const domains = ["example.stark", "test.stark"];
    const duration = 1;

    const expectedPrice =
      getPriceFromDomain(1, "example.stark") +
      getPriceFromDomain(1, "test.stark");
    expect(getPriceFromDomains(domains, duration)).toEqual(expectedPrice);
  });

  it("should return zero if no domains are provided", () => {
    const domains: string[] = [];
    const duration = 1;

    const expectedPrice = BigInt(0);
    expect(getPriceFromDomains(domains, duration)).toEqual(expectedPrice);
  });

  it("should return the total price for all provided domains", () => {
    const domains = ["example.stark", "qsd.stark", "a"];
    const duration = 2;

    const expectedPrice =
      getPriceFromDomain(2, "example.stark") +
      getPriceFromDomain(2, "qsd") +
      getPriceFromDomain(2, "q.stark");
    expect(getPriceFromDomains(domains, duration)).toEqual(expectedPrice);
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

    const expectedPrice = gweiToEth(
      String(
        getPriceFromDomains(
          ["fricoben.stark", "fricobens.stark", "allerpsg.stark"],
          1
        )
      )
    );

    expect(getTotalYearlyPrice(selectedDomains)).toEqual(expectedPrice);
  });

  it("should return '0' if no domains are selected", () => {
    const selectedDomains = {
      "fricoben.stark": false,
      "fricobens.stark": false,
      "lili.stark": false,
      "allerpsg.stark": false,
    };

    expect(getTotalYearlyPrice(selectedDomains)).toEqual("0");
  });

  it("should return '0' if selectedDomains is undefined", () => {
    expect(getTotalYearlyPrice(undefined)).toEqual("0");
  });
});
