import {
  hexToDecimal,
  decimalToHex,
  stringToHex,
  gweiToEth,
} from "../../utils/feltService";

describe("Should test hexToDecimal function", () => {
  it("Should return the right decimal address", () => {
    expect(
      hexToDecimal(
        "0x072D4F3FA4661228ed0c9872007fc7e12a581E000FAd7b8f3e3e5bF9E6133207"
      )
    ).toEqual(
      "3246245011749133880110396867610358293809804380010255939993086782333605065223"
    );
  });

  it("Should return an error cause the string is not an hex number", () => {
    expect(() => hexToDecimal("123321.ben.stark")).toThrow(
      new Error("Invalid hex string")
    );
  });

  it("Should return an empty string if the argument is undefined", () => {
    expect(hexToDecimal(undefined)).toEqual("");
  });
});

describe("Should test decimalToHex function", () => {
  it("Should return the right hex address", () => {
    expect(
      decimalToHex(
        "3246245011749133880110396867610358293809804380010255939993086782333605065223"
      )
    ).toEqual(
      "0x72d4f3fa4661228ed0c9872007fc7e12a581e000fad7b8f3e3e5bf9e6133207"
    );
  });

  it("Should return an empty string if the element is undefined", () => {
    expect(decimalToHex(undefined)).toEqual("");
  });

  it("Should convert a number to its hex representation", () => {
    expect(decimalToHex(123)).toEqual("0x7b");
  });

  it("Should convert 0 to 0x0", () => {
    expect(decimalToHex(0)).toEqual("0x0");
  });
});

describe("Should test the stringToHex function", () => {
  it("Should return an empty string if the element is undefined", () => {
    expect(stringToHex(undefined)).toEqual("");
  });

  it("Should return an empty string if the input is empty", () => {
    expect(stringToHex("")).toEqual("");
  });

  it("Should convert a string to its hex representation", () => {
    expect(stringToHex("hello")).toEqual("0x68656c6c6f");
  });
});

describe("Should test gweiToEth function", () => {
  it("Should return the right ETH value from a given Gwei value", () => {
    expect(gweiToEth("1000000000000000000")).toEqual("1");
    expect(gweiToEth("10000000000000000")).toEqual("0.01");
  });

  it("Should return 0 if the argument is an empty string", () => {
    expect(gweiToEth("")).toEqual("0");
  });
});
