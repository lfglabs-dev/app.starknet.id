import {
  generateSalt,
  generateSalts,
  computeMetadataHash,
} from "../../utils/userDataService";
import * as crypto from "crypto-browserify";

jest.mock("crypto-browserify", () => ({
  subtle: {
    digest: jest.fn(),
  },
}));

describe("generateSalt function", () => {
  it("should return a string with 32 characters (16 bytes)", () => {
    const salt = generateSalt();
    expect(typeof salt).toBe("string");
    expect(salt.length).toBe(32);
  });

  it("should return a different salt on each invocation", () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
  });

  it("should only contain hexadecimal characters", () => {
    const salt = generateSalt();
    const hexRegex = /^[0-9a-fA-F]+$/; // Regular expression for hexadecimal
    expect(hexRegex.test(salt)).toBe(true);
  });
});

describe("generateSalts function", () => {
  it("should generate an array of salts with the specified length", () => {
    const numberOfSalts = 5;
    const salts = generateSalts(numberOfSalts);

    expect(salts).toHaveLength(numberOfSalts);
    salts.forEach((salt) => {
      // Check if each salt is a valid hexadecimal string
      expect(/^[0-9a-fA-F]+$/.test(salt)).toBe(true);
    });
  });

  it("should generate unique salts", () => {
    const numberOfSalts = 10;
    const salts = generateSalts(numberOfSalts);

    // Check if all generated salts are unique
    const uniqueSalts = new Set(salts);
    expect(uniqueSalts.size).toBe(numberOfSalts);
  });

  it("should call generateSalt for each salt", () => {
    const numberOfSalts = 3;
    const spy = jest.spyOn(global.crypto, "getRandomValues");

    generateSalts(numberOfSalts);

    // Check if getRandomValues is called numberOfSalts times
    expect(spy).toHaveBeenCalledTimes(numberOfSalts);

    // Restore the spy to avoid side effects on other tests
    spy.mockRestore();
  });
});

describe("computeMetadataHash function", () => {
  const mockDigest = crypto.subtle.digest;

  beforeEach(() => {
    mockDigest.mockReset();
  });

  it("should compute metadata hash correctly", async () => {
    // Mock the result of crypto.subtle.digest
    const hashResult = new Uint8Array([1, 2, 3, 4]);
    mockDigest.mockResolvedValue(hashResult);

    const email = "test@example.com";
    const taxState = "CA";
    const salt = "somesalt";

    const expectedMessage = `${email}|${taxState}|${salt}`;
    const expectedData = new TextEncoder().encode(expectedMessage);

    const expectedHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      expectedData
    );
    const expectedHashArray = Array.from(new Uint8Array(expectedHashBuffer));
    const expectedHashHex = expectedHashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const expectedHash = expectedHashHex.substring(
      0,
      expectedHashHex.length - 2
    );

    const result = await computeMetadataHash(email, taxState, salt);

    expect(result).toBe(expectedHash);
    expect(mockDigest).toHaveBeenCalledWith("SHA-256", expectedData);
  });
});
