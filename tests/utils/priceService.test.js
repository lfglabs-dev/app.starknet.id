/* eslint-disable no-undef */
import { totalAlphabet } from "../../utils/constants";
import {
  PRICES,
  getPriceFromDomain,
  getPriceFromDomains,
} from "../../utils/priceService";
import { generateString } from "../../utils/stringService";

describe("Should test price service file", () => {
  it("Test getPriceFromDomain functions with different domains", () => {
    let randomString = generateString(0, totalAlphabet);
    expect(getPriceFromDomain(1, randomString.concat(".stark"))).toEqual(
      PRICES.ONE
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
    const domains = [];
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
