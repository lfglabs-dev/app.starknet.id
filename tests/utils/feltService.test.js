import {
  hexToDecimal,
  decimalToHex,
  stringToHex,
  gweiToEth,
  applyRateToBigInt,
  fromUint256,
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

describe("Should test applyRateToBigInt function", () => {
  it("Should return the correct value after multiplying by a percentage", () => {
    expect(applyRateToBigInt("100000000000000000000", 0.35)).toEqual(
      "35000000000000000000"
    );
    expect(applyRateToBigInt("100000000000000000000", 0.75)).toEqual(
      "75000000000000000000"
    );
    expect(applyRateToBigInt(BigInt("100000000000000000000"), 0.5)).toEqual(
      "50000000000000000000"
    );
  });

  it("Should return 0 if the argument is an empty string or zero", () => {
    expect(applyRateToBigInt("", 0.35)).toEqual("0");
    expect(applyRateToBigInt("0", 0.75)).toEqual("0");
    expect(applyRateToBigInt(BigInt(0), 0.5)).toEqual("0");
  });

  it("Should handle negative percentages", () => {
    expect(applyRateToBigInt("100000000000000000000", -0.35)).toEqual(
      "-35000000000000000000"
    );
  });
});

describe("fromUint256 function", () => {
  it("should correctly combine low and high BigInts", () => {
    expect(fromUint256(BigInt(1), BigInt(0))).toBe("1");
    expect(fromUint256(BigInt(0), BigInt(1))).toBe("340282366920938463463374607431768211456"); // 2^128
    expect(fromUint256(BigInt(1), BigInt(1))).toBe("340282366920938463463374607431768211457"); // 2^128 + 1
  });
  
  it("should handle edge cases", () => {
    expect(fromUint256(BigInt(0), BigInt(0))).toBe("0");
    expect(
      fromUint256(BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"), BigInt(0))
    ).toBe("340282366920938463463374607431768211455"); // 2^128 - 1
    expect(
      fromUint256(
        BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"), 
        BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
      )
    ).toBe("115792089237316195423570985008687907853269984665640564039457584007913129639935"); // 2^256 - 1
  });  
});
