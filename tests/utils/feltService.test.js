import { hexToDecimal, toHex, stringToHex } from "../../utils/feltService";

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

describe("Should test toHex function", () => {
  it("Should return the right hex address", () => {
    expect(
      toHex(
        "3246245011749133880110396867610358293809804380010255939993086782333605065223"
      )
    ).toEqual(
      "0x72d4f3fa4661228ed0c9872007fc7e12a581e000fad7b8f3e3e5bf9e6133207"
    );
  });

  it("Should return an empty string if the element is undefined", () => {
    expect(toHex(undefined)).toEqual("");
  });

  it("Should convert a number to its hex representation", () => {
    expect(toHex(123)).toEqual("0x7b");
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
