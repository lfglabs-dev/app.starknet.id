/* eslint-disable no-undef */
import { PRICES, getYearlyPriceFromDomain } from "../../utils/priceService";
import {
  charactersWithBigAlphabet,
  generateString,
} from "../../utils/stringService";

describe("Should test price service file", () => {
  it("Test getYearlyPriceFromDomain functions with different domains", () => {
    let randomString = generateString(0, charactersWithBigAlphabet);
    expect(getYearlyPriceFromDomain(randomString.concat(".stark"))).toEqual(
      PRICES.ONE
    );

    randomString = generateString(1, charactersWithBigAlphabet);
    expect(getYearlyPriceFromDomain(randomString.concat(".stark"))).toEqual(
      PRICES.ONE
    );

    randomString = generateString(2, charactersWithBigAlphabet);
    expect(getYearlyPriceFromDomain(randomString.concat(".stark"))).toEqual(
      PRICES.TWO
    );

    randomString = generateString(3, charactersWithBigAlphabet);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.THREE);

    randomString = generateString(4, charactersWithBigAlphabet);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.FOUR);

    randomString = generateString(5, charactersWithBigAlphabet);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.FIVE);

    randomString = generateString(6, charactersWithBigAlphabet);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.FIVE);
  });
});
