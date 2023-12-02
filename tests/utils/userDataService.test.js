import {
  generateSalt,
  generateSalts,
  computeMetadataHash,
} from "../../utils/userDataService";

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
  it("should compute metadata hash correctly", async () => {
    const metadata = {
      name: "Test NFT",
      description: "Test NFT description",
      image: "https://test.com/image.png",
    };

    const expectedHash =
      "6b066616d8fe4ef7bbeade684da7aba3ae89ca68c142cf53bb90a80baced9e";

    const hash = await computeMetadataHash(metadata);
    expect(hash).toBe(expectedHash);
  });
});
