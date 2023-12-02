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
  it("should return an array of salts with the specified length", () => {
    const salts = generateSalts(5);
    expect(Array.isArray(salts)).toBe(true);
    expect(salts.length).toBe(5);
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
