import { PRICES, getYearlyPriceFromDomain } from "../../utils/priceService";
import { generateString } from "../../hooks/string";

describe("Should test price service file", () => {
  it("Test getYearlyPriceFromDomain functions with different domains", () => {
    let randomString = generateString(0);
    expect(getYearlyPriceFromDomain(randomString.concat(".stark"))).toEqual(
      PRICES.ONE
    );

    randomString = generateString(1);
    expect(getYearlyPriceFromDomain(randomString.concat(".stark"))).toEqual(
      PRICES.ONE
    );

    randomString = generateString(2);
    expect(getYearlyPriceFromDomain(randomString.concat(".stark"))).toEqual(
      PRICES.TWO
    );

    randomString = generateString(3);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.THREE);

    randomString = generateString(4);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.FOUR);

    randomString = generateString(5);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.FIVE);

    randomString = generateString(6);
    expect(getYearlyPriceFromDomain(randomString)).toEqual(PRICES.FIVE);
  });
});
