import {
  isIdentityExpiringSoon,
  timestampToReadableDate,
} from "../../utils/dateService";

describe("timestampToReadableDate", () => {
  it("should convert a millisecond-based timestamp to a human-readable date string", () => {
    const timestamp = 1677724800000; // Corrected timestamp
    const expectedResult = "Thu Mar 02 2023";
    expect(timestampToReadableDate(timestamp)).toEqual(expectedResult);
  });

  it("should convert a second-based timestamp to a human-readable date string", () => {
    const timestamp = 1677724800; // Corrected timestamp
    const expectedResult = "Thu Mar 02 2023";
    expect(timestampToReadableDate(timestamp)).toEqual(expectedResult);
  });

  it("should handle negative timestamps (dates before 1970)", () => {
    const timestamp = -315619200000;
    const expectedResult = "Fri Jan 01 1960";
    expect(timestampToReadableDate(timestamp)).toEqual(expectedResult);
  });
});

describe("isIdentityExpiringSoon", () => {
  const currentTime = Math.floor(Date.now() / 1000);

  it("should return false if domain_expiry is null", () => {
    const identity = {
      id: "test-id",
      domain: "ben.ben.stark",
      domain_expiry: null,
    };
    expect(isIdentityExpiringSoon(identity)).toBe(false);
  });

  it("should return false if domain is empty", () => {
    const identity = {
      id: "test-id",
      domain: "",
      domain_expiry: currentTime + 60 * 60 * 24 * 30, // 30 days from now
    };
    expect(isIdentityExpiringSoon(identity)).toBe(false);
  });

  it("should return false if domain is not a Stark root domain", () => {
    const identity = {
      id: "test-id",
      domain: "non-stark.example.stark",
      domain_expiry: currentTime + 60 * 60 * 24 * 30, // 30 days from now
    };
    expect(isIdentityExpiringSoon(identity)).toBe(false);
  });

  it("should return false if domain expiry is more than 90 days away", () => {
    const identity = {
      id: "test-id",
      domain: "ben.stark",
      domain_expiry: currentTime + 60 * 60 * 24 * 120, // 120 days from now
    };
    expect(isIdentityExpiringSoon(identity)).toBe(false);
  });

  it("should return true if domain expiry is less than 30 days away", () => {
    const identity = {
      id: "test-id",
      domain: "ben.stark",
      domain_expiry: currentTime + 60 * 60 * 24 * 30, // 30 days from now
    };
    expect(isIdentityExpiringSoon(identity)).toBe(true);
  });
});
