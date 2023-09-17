/* eslint-disable no-undef */
import { totalAlphabet } from "../../utils/constants";
import { PRICES, getPriceFromDomain } from "../../utils/priceService";
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
